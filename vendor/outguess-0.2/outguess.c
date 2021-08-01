/*
 * Outguess - a Universal Steganograpy Tool for
 *
 * Copyright (c) 1999-2001 Niels Provos <provos@citi.umich.edu>
 * Features
 * - preserves frequency count based statistics
 * - multiple data embedding
 * - PRNG driven selection of bits
 * - error correcting encoding
 * - modular architecture for different selection and embedding algorithms
 */

/*
 * Copyright (c) 1999-2001 Niels Provos <provos@citi.umich.edu>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. All advertising materials mentioning features or use of this software
 *    must display the following acknowledgement:
 *      This product includes software developed by Niels Provos.
 * 4. The name of the author may not be used to endorse or promote products
 *    derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR
 * IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
 * OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT,
 * INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT
 * NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF
 * THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

#include <emscripten/emscripten.h>

#include <sys/types.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <ctype.h>
#include <fcntl.h>
#include <unistd.h>
#include <math.h>

#include "config.h"

#include "arc.h"
#include "outguess.h"
#include "golay.h"
#include "pnm.h"
#include "jpg.h"
#include "iterator.h"
#include "typedetect.h"

#ifndef MAP_FAILED
/* Some Linux systems are missing this */
#define MAP_FAILED	(void *)-1
#endif /* MAP_FAILED */

bitmap bm;
uint8_t *decode_result_data;
uint32_t decode_result_len;
int decode_result_type;
int image_width;
int image_height;
int image_depth;
int image_max;

static int steg_err_buf[CODEBITS];
static int steg_err_cnt;
static int steg_errors;
static int steg_encoded;

int steg_foil;
int steg_foilfail;

static int steg_count;
static int steg_mis;
static int steg_mod;
static int steg_data;

/* Exported variables */

int steg_stat;

/* format handlers */

handler *handlers[] = {
	&pnm_handler,
	&jpg_handler
};

handler *
get_handler(char *name)
{
	int i;

	if (!(name = strrchr(name, '.')))
		return NULL;
	name++;

	for (i = sizeof(handlers)/sizeof(handler *) - 1; i >= 0; i--)
		if (!strcasecmp(name, handlers[i]->extension))
			return handlers[i];

	return NULL;
}

void *
checkedmalloc(size_t n)
{
	void *p;

	if (!(p = malloc(n))) {
		fprintf(stderr, "checkedmalloc: not enough memory\n");
		exit(1);
	}

	return p;
}

/*
 * The error correction might allow us to introduce extra errors to
 * avoid modifying data.  Choose to leave bits with high detectability
 * untouched.
 */

void
steg_adjust_errors(bitmap *bitmap, int flags)
{
	int i, j, n, many, flag;
	int priority[ERRORBITS], detect[ERRORBITS];

	many = ERRORBITS - steg_errors;
	for (j = 0; j < many && j < steg_err_cnt; j++) {
		priority[j] = steg_err_buf[j];
		detect[j] = bitmap->detect[priority[j]];
	}

	/* Very simple sort */
	do {
		for (flag = 0, i = 0; i < j - 1; i++)
			if (detect[i] < detect[i + 1]) {
				SWAP(detect[i], detect[i+1]);
				SWAP(priority[i], priority[i+1]);
				flag = 1;
			}
	} while (flag);

	for (i = j; i < steg_err_cnt; i++) {
		for (n = 0; n < j; n++)
			if (detect[n] < bitmap->detect[steg_err_buf[i]])
				break;
		if (n < j - 1) {
			memmove(detect + n + 1, detect + n,
				(j - n) * sizeof(int));
			memmove(priority + n + 1, priority + n,
				(j - n) * sizeof(int));
		}
		if (n < j) {
			priority[n] = steg_err_buf[i];
			detect[n] = bitmap->detect[steg_err_buf[i]];
		}
	}

	for (i = 0; i < j; i++) {
		if (flags & STEG_EMBED) {
			WRITE_BIT(bitmap->locked, i, 0);
			if (TEST_BIT(bitmap->bitmap, priority[i]))
				WRITE_BIT(bitmap->bitmap, i, 0);
			else
				WRITE_BIT(bitmap->bitmap, i, 1);
		}
		steg_mis--;
		steg_mod -= detect[i];
	}
}

int
steg_embedchunk(bitmap *bitmap, iterator *iter, uint32_t data, int bits, int embed)
{
	int i = ITERATOR_CURRENT(iter);
	uint8_t bit;
	uint32_t val;
	char *pbits, *plocked;
	int nbits;

	pbits = bitmap->bitmap;
	plocked = bitmap->locked;
	nbits = bitmap->bits;

	while (i < nbits && bits) {
		if ((embed & STEG_ERROR) && !steg_encoded) {
			if (steg_err_cnt > 0)
				steg_adjust_errors(bitmap, embed);
			steg_encoded = CODEBITS;
			steg_errors = 0;
			steg_err_cnt = 0;
			memset(steg_err_buf, 0, sizeof(steg_err_buf));
		}
		steg_encoded--;

		bit = TEST_BIT(pbits, i) ? 1 : 0;
		val = bit ^ (data & 1);
		steg_count++;
		if (val == 1) {
			steg_mod += bitmap->detect[i];
			steg_mis++;
		}

		/* Check if we are allowed to change a bit here */
		if ((val == 1) && TEST_BIT(plocked, i)) {
			if (!(embed & STEG_ERROR) || (++steg_errors > 3))
				return 0;
			val = 2;
		}

		/* Store the bits we changed in error encoding mode */
		if ((embed & STEG_ERROR) && val == 1)
			steg_err_buf[steg_err_cnt++] = i;

		if (val != 2 && (embed & STEG_EMBED)) {
			WRITE_BIT(plocked, i, 1);
      			WRITE_BIT(pbits, i, data & 1);
		}

		data >>= 1;
		bits--;

		i = iterator_next(iter, bitmap);
	}

	return 1;
}

stegres
steg_embed(bitmap *bitmap, iterator *iter, struct arc4_stream *as,
	   uint8_t *data, uint32_t datalen, uint16_t seed, int embed)
{
	uint32_t i, len;
	uint32_t tmp = 0;
	uint8_t tmpbuf[4], *encbuf;
	stegres result;

	steg_count = steg_mis = steg_mod = 0;

	memset(&result, 0, sizeof(result));

	if (bitmap->bits / (datalen * 8) < 2) {
		fprintf(stderr, "steg_embed: not enough bits in bitmap "
			"for embedding: %d > %d/2\n",
			datalen * 8, bitmap->bits);
		exit (1);
	}

	if (embed & STEG_EMBED)
		fprintf(stderr, "Embedding data: %d in %d\n",
			datalen * 8, bitmap->bits);

	/* Clear error counter */
	steg_encoded = 0;
	steg_err_cnt = 0;

	/* Encode the seed and datalen */
	tmpbuf[0] = seed & 0xff;
	tmpbuf[1] = seed >> 8;
	tmpbuf[2] = datalen & 0xff;
	tmpbuf[3] = datalen >> 8;

	/* Encode the admin data XXX maybe derive another stream */
	len = 4;
	encbuf = encode_data(tmpbuf, &len, as, embed);

	for (i = 0; i < len; i++)
		if (!steg_embedchunk(bitmap, iter, encbuf[i], 8, embed)) {
			free (encbuf);

			/* If we use error correction or a bit in the seed
			 * was locked, we can go on, otherwise we have to fail.
			 */
			if ((embed & STEG_ERROR) ||
			    steg_count < 16 /* XXX */)
				result.error = STEG_ERR_HEADER;
			else
				result.error = STEG_ERR_PERM;
			return result;
		}
	free (encbuf);

	/* Clear error counter again, a new ECC block starts */
	steg_encoded = 0;

	iterator_seed(iter, bitmap, seed);

	while (ITERATOR_CURRENT(iter) < bitmap->bits && datalen > 0) {
		iterator_adapt(iter, bitmap, datalen);

		tmp = *data++;
		datalen--;

		if (!steg_embedchunk(bitmap, iter, tmp, 8, embed)) {
			result.error = STEG_ERR_BODY;
			return result;
		}
	}

	/* Final error adjustion after end */
	if ((embed & STEG_ERROR) && steg_err_cnt > 0)
	  steg_adjust_errors(bitmap, embed);

	if (embed & STEG_EMBED) {
		fprintf(stderr, "Bits embedded: %d, "
			"changed: %d(%2.1f%%)[%2.1f%%], "
			"bias: %d, tot: %d, skip: %d\n",
			steg_count, steg_mis,
			(float) 100 * steg_mis/steg_count,
			(float) 100 * steg_mis/steg_data, /* normalized */
			steg_mod,
			ITERATOR_CURRENT(iter),
			ITERATOR_CURRENT(iter) - steg_count);
	}

	result.changed = steg_mis;
	result.bias = steg_mod;

	return result;
}

uint32_t
steg_retrbyte(bitmap *bitmap, int bits, iterator *iter)
{
	uint32_t i = ITERATOR_CURRENT(iter);
	uint32_t tmp = 0;
	int where;

	for (where = 0; where < bits; where++) {
		tmp |= (TEST_BIT(bitmap->bitmap, i) ? 1 : 0) << where;

		i = iterator_next(iter, bitmap);
	}

	return tmp;
}

uint8_t *
steg_retrieve(uint32_t *len, bitmap *bitmap, iterator *iter,
			  struct arc4_stream *as, int flags)
{
	uint32_t n;
	int i;
	uint32_t origlen;
	uint16_t seed;
	uint32_t datalen;
	uint8_t *buf;
	uint8_t *tmpbuf;


	datalen = 4;
	encode_data(NULL, &datalen, NULL, flags);
	tmpbuf = checkedmalloc(datalen);

	for (i = 0; i < datalen; i++)
		tmpbuf[i] = steg_retrbyte(bitmap, 8, iter);

	buf = decode_data (tmpbuf, &datalen, as, flags);

	if (datalen != 4) {
		// fprintf (stderr, "Steg retrieve: wrong data len: %d\n", datalen);
		return NULL;
	}

	free (tmpbuf);

	seed = buf[0] | (buf[1] << 8);
	origlen = datalen = buf[2] | (buf[3] << 8);

	free (buf);

	// fprintf(stderr, "Steg retrieve: seed: %d, len: %d\n", seed, datalen);

	if (datalen > bitmap->bytes) {
		// fprintf(stderr, "Extracted datalen is too long: %d > %d\n", datalen, bitmap->bytes);
		return NULL;
	}

	buf = checkedmalloc(datalen);

	iterator_seed(iter, bitmap, seed);

	n = 0;
	while (datalen > 0) {
		iterator_adapt(iter, bitmap, datalen);

		// Sometimes, iter->skipmod becomes 0,
		// resulting in a floatingpoint exception
		if (iter->skipmod == 0)
		{
			buf[n++] = 0;
			datalen--;
			continue;
		}

		buf[n++] = steg_retrbyte(bitmap, 8, iter);
		datalen --;
	}

	*len = origlen;
	return buf;
}

int
steg_find(bitmap *bitmap, iterator *iter, struct arc4_stream *as,
	  int siter, int siterstart,
	  uint8_t *data, uint32_t datalen, int flags)
{
	int changed, tch, half, chmax, chmin;
	int j, i, size = 0;
	struct arc4_stream tas;
	iterator titer;
	uint16_t *chstats = NULL;
	stegres result;

	half = datalen * 8 / 2;

	if (!siter && !siterstart)
		siter = DEFAULT_ITER;

	if (siter && siterstart < siter) {
		if (steg_stat) {
			/* Collect stats about changed bit */
			size = siter - siterstart;
			chstats = checkedmalloc(size * sizeof(uint16_t));
			memset(chstats, 0, size * sizeof(uint16_t));
		}

		fprintf(stderr, "Finding best embedding...\n");
		changed = chmin = chmax = -1; j = -STEG_ERR_HEADER;

		for (i = siterstart; i < siter; i++) {
			titer = *iter;
			tas = *as;
			result = steg_embed(bitmap, &titer, &tas,
					 data, datalen, i, flags);
			/* Seed does not effect any more */
			if (result.error == STEG_ERR_PERM)
				return -result.error;
			else if (result.error)
				continue;

			/*
			 * Only count bias, if we do not modifiy many
			 * extra bits for statistical foiling.
			 */
			tch = result.changed + result.bias;

			if (steg_stat)
				chstats[i - siterstart] = result.changed;

			if (chmax == -1 || result.changed > chmax)
				chmax = result.changed;
			if (chmin == -1 || result.changed < chmin)
				chmin = result.changed;

			if (changed == -1 || tch < changed) {
				changed = tch;
				j = i;
				fprintf(stderr, "%5u: %5u(%3.1f%%)[%3.1f%%], bias %5d(%1.2f), saved: % 5d, total: %5.2f%%\n",
					j, result.changed,
					(float) 100 * steg_mis / steg_count,
					(float) 100 * steg_mis / steg_data,
					result.bias,
					(float)result.bias / steg_mis,
					(half - result.changed) / 8,
					(float) 100 * steg_mis / bitmap->bits);
			}
		}

		if (steg_stat && (chmax - chmin > 1)) {
			double mean = 0, dev, sq;
			int cnt = 0, count = chmax - chmin + 1;
			uint16_t *chtab;
			int chtabcnt = 0;

			chtab = checkedmalloc(count * sizeof(uint16_t));
			memset(chtab, 0, count * sizeof(uint16_t));

			for (i = 0; i < size; i++)
				if (chstats[i] > 0) {
					mean += chstats[i];
					cnt++;
					chtab[chstats[i] - chmin]++;
					chtabcnt++;
				}

			mean = mean / cnt;
			dev = 0;
			for (i = 0; i < size; i++)
				if (chstats[i] > 0) {
					sq = chstats[i] - mean;
					dev += sq * sq;
				}

			fprintf(stderr, "Changed bits. Min: %d, Mean: %f, +- %f, Max: %d\n",
				chmin,
				mean, sqrt(dev / (cnt - 1)),
				chmax);

			if (steg_stat > 1)
				for (i = 0; i < count; i++) {
					if (!chtab[i])
						continue;
					fprintf(stderr, "%d: %.9f\n",
						chmin + i,
						(double)chtab[i]/chtabcnt);
				}

			free (chtab);
			free (chstats);
		}

		fprintf(stderr, "%d, %d: ", j, changed);
	} else
		j = siterstart;

	return j;
}

/* graphic file handling routines */

uint8_t *
encode_data(uint8_t *data, uint32_t *len, struct arc4_stream *as, int flags)
{
	int j, datalen = *len;
	uint8_t *encdata;

	if (flags & STEG_ERROR) {
		int eclen, i = 0, length = 0;
		uint32_t tmp;
		uint64_t code = 0;
		uint8_t edata[3];

		datalen = datalen + (3 - (datalen % 3));
		eclen = (datalen * 8 / DATABITS * CODEBITS + 7)/ 8;

		if (data == NULL) {
			*len = eclen;
			return NULL;
		}

		encdata = checkedmalloc(3 * eclen * sizeof(uint8_t));
		while (datalen > 0) {
			if (datalen > 3)
				memcpy(edata, data, 3);
			else {
				int adj = *len % 3;
				memcpy (edata, data, adj);

				/* Self describing padding */
				for (j = 2; j >= adj; j--)
					edata[j] = j - adj;
			}
			tmp = edata[0];
			tmp |= edata[1] << 8;
			tmp |= edata[2] << 16;

			data += 3;
			datalen -= 3;

			for (j = 0; j < 2; j++) {
				code |= ENCODE(tmp & DATAMASK) << length;
				length += CODEBITS;
				while (length >= 8) {
					encdata[i++] = code & 0xff;
					code >>= 8;
					length -= 8;
				}
				tmp >>= DATABITS;
			}
		}

		/* Encode the rest */
		if (length > 0)
			encdata[i++] = code & 0xff;

		datalen = eclen;
		data = encdata;
	} else {
		if (data == NULL) {
			*len = datalen;
			return NULL;
		}
		encdata = checkedmalloc(datalen * sizeof(uint8_t));
	}

	/* Encryption */
	for (j = 0; j < datalen; j++)
		encdata[j] = data[j] ^ arc4_getbyte(as);

	*len = datalen;

	return encdata;
}

uint8_t *
decode_data(uint8_t *encdata, uint32_t *len, struct arc4_stream *as, int flags)
{
	int i, j, enclen = *len, declen;
	uint8_t *data;

	for (j = 0; j < enclen; j++)
		encdata[j] = encdata[j] ^ arc4_getbyte(as);

	if (flags & STEG_ERROR) {
		uint32_t inbits = 0, outbits = 0, etmp, dtmp;

		declen = enclen * DATABITS / CODEBITS;
		data = checkedmalloc(declen * sizeof(uint8_t));

		etmp = dtmp = 0;
		for (i = 0, j = 0; i < enclen && j < declen; ) {
			while (outbits < CODEBITS) {
				etmp |= TDECODE(encdata + i, enclen)<< outbits;
				i++;
				outbits += 8;
			}
			dtmp |= (DECODE(etmp & CODEMASK) >>
				 (CODEBITS - DATABITS)) << inbits;
			inbits += DATABITS;
			etmp >>= CODEBITS;
			outbits -= CODEBITS;
			while (inbits >= 8) {
				data[j++] = dtmp & 0xff;
				dtmp >>= 8;
				inbits -= 8;
			}
		}

		i = data[declen -1];
		if (i > 2) {
			fprintf (stderr, "decode_data: padding is incorrect: %d\n",
				 i);
			*len = 0;
			return data;
		}
		for (j = i; j >= 0; j--)
			if (data[declen - 1 - i + j] != j)
				break;
		if (j >= 0) {
			fprintf (stderr, "decode_data: padding is incorrect: %d\n",
				 i);
			*len = 0;
			return data;
		}

		declen -= i + 1;
		fprintf (stderr, "Decode: %d data after ECC: %d\n",
			 *len, declen);

	} else {
		data = checkedmalloc(enclen * sizeof(uint8_t));
		declen = enclen;
		memcpy (data, encdata, declen);
	}

	*len = declen;
	return data;
}

int
do_embed(bitmap *bitmap, uint8_t *filename, uint8_t *key, int klen,
	 config *cfg, stegres *result)
{
	iterator iter;
	struct arc4_stream as, tas;
	uint8_t *encdata, *data;
	uint32_t datalen, enclen;
	size_t correctlen;
	int j;

	/* Initialize random data stream */
	arc4_initkey(&as,  "Encryption", key, klen);
	tas = as;

	iterator_init(&iter, bitmap, key, klen);

	/* Encode the data for us */
	mmap_file(filename, &data, &datalen);
	steg_data = datalen * 8;
	enclen = datalen;
	encdata = encode_data(data, &enclen, &tas, cfg->flags);
	if (cfg->flags & STEG_ERROR) {
		fprintf(stderr, "Encoded '%s' with ECC: %d bits, %d bytes\n",
			filename, enclen * 8, enclen);
		correctlen = enclen / 2 * 8;
	} else {
		fprintf(stderr, "Encoded '%s': %d bits, %d bytes\n",
			filename, enclen * 8, enclen);
		correctlen = enclen * 8;
	}
	if (bitmap->maxcorrect && correctlen > bitmap->maxcorrect) {
		fprintf(stderr, "steg_embed: "
			"message larger than correctable size %d > %d\n",
			correctlen, bitmap->maxcorrect);
		exit(1);
	}

	munmap_file(data, datalen);

	j = steg_find(bitmap, &iter, &as, cfg->siter, cfg->siterstart,
		      encdata, enclen, cfg->flags);
	if (j < 0) {
		fprintf(stderr, "Failed to find embedding.\n");
		goto out;
	}

	*result = steg_embed(bitmap, &iter, &as, encdata, enclen, j,
			    cfg->flags | STEG_EMBED);

 out:
	free(encdata);

	return (j);
}

void
mmap_file(uint8_t *name, uint8_t **data, uint32_t *size)
{
	int fd;
	struct stat fs;
	uint8_t *p;

	if ((fd = open((char *)name, O_RDONLY, 0)) == -1) {
		fprintf(stderr, "Can not open %s\n", name);
		exit(1);
	}

	if (fstat(fd, &fs) == -1) {
		perror("fstat");
		exit(1);
	}

#ifdef HAVE_MMAP
	if ((p = mmap(NULL, fs.st_size, PROT_READ, MAP_SHARED, fd, 0)) == MAP_FAILED) {
		perror("mmap");
		exit(1);
	}
#else
	p = checkedmalloc(fs.st_size);
	if (read(fd, p, fs.st_size) != fs.st_size) {
		perror("read");
		exit(1);
	}
#endif /* HAVE_MMAP */
	close(fd);

	*data = p;
	*size = fs.st_size;
}

void
munmap_file(uint8_t *data, int len)
{
#ifdef HAVE_MMAP
	if (munmap(data, len) == -1) {
		perror("munmap");
		exit(1);
	}
#else
	free (data);
#endif /* HAVE_MMAP */
}

int
test_file_type(uint8_t *data, uint32_t len)
{
	int result = RESULT_UNKNOWN;

	if (len >= 16)
	{
		result = detect_jpeg(data, len);
		if (result != RESULT_UNKNOWN) {
			return result;
		}

		result = detect_png(data, len);
		if (result != RESULT_UNKNOWN)
		{
			return result;
		}

		result = detect_gif(data, len);
		if (result != RESULT_UNKNOWN)
		{
			return result;
		}

		result = detect_tiff(data, len);
		if (result != RESULT_UNKNOWN)
		{
			return result;
		}

		result = detect_pdf(data, len);
		if (result != RESULT_UNKNOWN)
		{
			return result;
		}

		result = detect_wav(data, len);
		if (result != RESULT_UNKNOWN)
		{
			return result;
		}

		result = detect_utf8(data, len);
		if (result != RESULT_UNKNOWN)
		{
			return result;
		}
	}

	return RESULT_UNKNOWN;
}

EMSCRIPTEN_KEEPALIVE
uint8_t *get_decode_result_data()
{
	return decode_result_data;
}

EMSCRIPTEN_KEEPALIVE
uint32_t get_decode_result_len()
{
	return decode_result_len;
}

EMSCRIPTEN_KEEPALIVE
int get_decode_result_type()
{
	return decode_result_type;
}

EMSCRIPTEN_KEEPALIVE
void free_decode_result_data()
{
	free(decode_result_data);
	decode_result_data = NULL;
	decode_result_len = 0;
	decode_result_type = RESULT_UNKNOWN;
}

EMSCRIPTEN_KEEPALIVE
int decode(uint8_t *key)
{
	struct arc4_stream as, tas;
	iterator iter;
	unsigned char *encdata;

	/* Initialize random data stream */
	arc4_initkey(&as, "Encryption", key, strlen((char *)key));
	tas = as;

	iterator_init(&iter, &bm, key, strlen((char *)key));

	encdata = steg_retrieve(&decode_result_len, &bm, &iter, &as, 0);
	if (encdata == NULL)
	{
		decode_result_data = NULL;
		decode_result_len = 0;
		decode_result_type = RESULT_UNKNOWN;
		return 1;
	}

	decode_result_data = decode_data(encdata, &decode_result_len, &tas, 0);

	decode_result_type = test_file_type(decode_result_data, decode_result_len);

	free(encdata);

	if (decode_result_type == RESULT_UNKNOWN)
	{
		free(decode_result_data);
		decode_result_data = NULL;
		decode_result_len = 0;
		return 1;
	}

	return 0;
}

EMSCRIPTEN_KEEPALIVE
int get_image_width()
{
	return image_width;
}

EMSCRIPTEN_KEEPALIVE
int get_image_height()
{
	return image_height;
}

EMSCRIPTEN_KEEPALIVE
int get_image_depth()
{
	return image_depth;
}

EMSCRIPTEN_KEEPALIVE
int get_image_max()
{
	return image_max;
}

EMSCRIPTEN_KEEPALIVE
int read_bitmap(uint8_t *buf, int size)
{
	FILE *file = fmemopen(buf, size, "rb");

	fprintf(stderr, "read %d", size);

	image *image = jpg_handler.read(file);
	if (image == NULL)
	{
		decode_result_data = NULL;
		decode_result_len = 0;
		decode_result_type = RESULT_UNKNOWN;

		image_width = 0;
		image_height = 0;
		image_depth = 0;
		image_max = 0;

		free(buf);
		fclose(file);

		return 1;
	}

	image_width = image->x;
	image_height = image->y;
	image_depth = image->depth;
	image_max = image->max;

	jpg_handler.get_bitmap(&bm, image, STEG_RETRIEVE);

	free(image->img);
	free(image);

	free(buf);
	fclose(file);

	return 0;
}

EMSCRIPTEN_KEEPALIVE
void free_bitmap()
{
	free(bm.bitmap);
	free(bm.locked);
}

EMSCRIPTEN_KEEPALIVE
uint8_t *create_buffer(int size)
{
	return malloc(size);
}

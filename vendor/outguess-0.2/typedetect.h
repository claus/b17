#ifndef _TYPEDETECT_H
#define _TYPEDETECT_H

#include <stdint.h>

#define RESULT_UNKNOWN 0
#define RESULT_JPEG 1
#define RESULT_PNG 2
#define RESULT_GIF 3
#define RESULT_TIFF 4
#define RESULT_PDF 5
#define RESULT_WAV 6
#define RESULT_UTF8 7

int detect_jpeg(uint8_t *data, uint32_t len);
int detect_png(uint8_t *data, uint32_t len);
int detect_gif(uint8_t *data, uint32_t len);
int detect_tiff(uint8_t *data, uint32_t len);
int detect_pdf(uint8_t *data, uint32_t len);
int detect_wav(uint8_t *data, uint32_t len);
int detect_utf8(uint8_t *data, uint32_t len);

#endif

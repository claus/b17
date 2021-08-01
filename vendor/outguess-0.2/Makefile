srcdir		= .

CC			= emcc -pipe -Wall
CFLAGS		= -g -O3 -Imissing $(JPEGINCS)
LDFLAGS		=
LIBS		= $(JPEGLIBS) -lm

JPEGDIR		= ./jpeg-6b-steg
JPEGINCS	= -I$(JPEGDIR)
JPEGLIBS	= -L$(JPEGDIR) -ljpeg
JPEGDEP		= $(JPEGDIR)/libjpeg.a

MISSING		= md5.o
OBJ			= outguess.o golay.o arc.o pnm.o jpg.o iterator.o typedetect.o

all: outguess

$(MISSING):
	$(CC) $(CFLAGS) $(INCS) -c  missing/md5.c

outguess: $(JPEGDEP) $(OBJ) $(MISSING)
	$(CC) $(CFLAGS) $(INCS) -o $@ $(OBJ) $(MISSING) $(LDFLAGS) $(LIBS)

$(JPEGDEP):
	cd $(JPEGDIR); $(MAKE) libjpeg.a

clean:
	cd $(JPEGDIR); $(MAKE) $@
	rm -f outguess *~ $(OBJ) $(MISSING)

distclean: clean
	cd $(JPEGDIR); $(MAKE) $@
	rm -f Makefile config.h config.status config.cache config.log

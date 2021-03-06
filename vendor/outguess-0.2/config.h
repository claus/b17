/* config.h.  Generated automatically by configure.  */
/* config.h.in.  Generated automatically from configure.in by autoheader.  */

/* Define if you have strcasecmp, as a function or macro.  */
#define HAVE_STRCASECMP 1

/* Define if you have snprintf, as a function or macro.  */
#define HAVE_SNPRINTF 1

/* Define if you have a working `mmap' system call.  */
/* #undef HAVE_MMAP */

/* Define to `unsigned' if <sys/types.h> doesn't define.  */
#define size_t unsigned

/* Define if you have the ANSI C header files.  */
/* #undef STDC_HEADERS */

/* Define to `unsigned long long' if <sys/types.h> doesn't define.  */
#define u_int64_t unsigned long long

/* Define to `unsigned int' if <sys/types.h> doesn't define.  */
#define u_int32_t unsigned int

/* Define to `unsigned short' if <sys/types.h> doesn't define.  */
#define u_int16_t unsigned short

/* Define to `unsigned char' if <sys/types.h> doesn't define.  */
#define u_int8_t unsigned char

/* Define if you have the getpagesize function.  */
#define HAVE_GETPAGESIZE 1

/* Define if you have the memcpy function.  */
#define HAVE_MEMCPY 1

/* Define if you have the strrchr function.  */
#define HAVE_STRRCHR 1

/* Define if you have the <fcntl.h> header file.  */
/* #undef HAVE_FCNTL_H */

/* Define if you have the <md5.h> header file.  */
/* #undef HAVE_MD5_H */

/* Define if you have the <err.h> header file.  */
/* #undef HAVE_ERR_H */

/* Define if you have the <unistd.h> header file.  */
/* #undef HAVE_UNISTD_H */

#if STDC_HEADERS || HAVE_STRING_H
# include <string.h>
#else
# ifndef HAVE_STRCHR
#  define strchr index
#  define strrchr rindex
# endif
char *strchr (), *strrchr ();
# ifndef HAVE_MEMCPY
#  define memcpy(d, s, n) bcopy ((s), (d), (n))
#  define memmove(d, s, n) bcopy ((s), (d), (n))
# endif
#endif

#ifndef HAVE_STRCASECMP
#define strcasecmp strcmp
#endif

#ifndef __P
#define __P(x)	x
#endif

make && \
emcc -O3 \
    -s WASM=1 \
    -s ENVIRONMENT=web \
    -s EXPORTED_RUNTIME_METHODS='["cwrap"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s FORCE_FILESYSTEM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME='OutguessModule' \
    jpeg-6b-steg/libjpeg.a \
    outguess.o \
    golay.o \
    arc.o \
    pnm.o \
    jpg.o \
    iterator.o \
    typedetect.o \
    md5.o \
    -o outguess.js && \
cp outguess.js ../../public/assets/outguess && \
cp outguess.wasm ../../public/assets/outguess

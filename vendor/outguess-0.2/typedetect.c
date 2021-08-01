#include "outguess.h"
#include "typedetect.h"

int detect_jpeg(uint8_t *data, uint32_t len)
{
    if (len > 3)
    {
        if (data[0] == 0xff && data[1] == 0xd8)
        {
            if (data[2] == 0xff && data[3] == 0xdb)
            {
                return RESULT_JPEG;
            }
            if (data[2] == 0xff && data[3] == 0xee)
            {
                return RESULT_JPEG;
            }
            if (len > 11)
            {
                if (data[2] == 0xff &&
                    data[3] == 0xe0 &&
                    data[4] == 0x00 &&
                    data[5] == 0x10 &&
                    data[6] == 0x4a &&
                    data[7] == 0x46 &&
                    data[8] == 0x49 &&
                    data[9] == 0x46 &&
                    data[10] == 0x00 &&
                    data[11] == 0x01)
                {
                    return RESULT_JPEG;
                }
                if (data[2] == 0xff &&
                    data[3] == 0xe1 &&
                    data[6] == 0x45 &&
                    data[7] == 0x78 &&
                    data[8] == 0x69 &&
                    data[9] == 0x66 &&
                    data[10] == 0x00 &&
                    data[11] == 0x00)
                {
                    return RESULT_JPEG;
                }
            }
        }
    }

    return RESULT_UNKNOWN;
}

int detect_png(uint8_t *data, uint32_t len)
{
    if (len > 7)
    {
        if (data[0] == 0x89 &&
            data[1] == 0x50 &&
            data[2] == 0x4e &&
            data[3] == 0x47 &&
            data[4] == 0x0d &&
            data[5] == 0x0a &&
            data[6] == 0x1a &&
            data[7] == 0x0a)
        {
            return RESULT_PNG;
        }
    }

    return RESULT_UNKNOWN;
}

int detect_gif(uint8_t *data, uint32_t len)
{
    if (len > 5)
    {
        if (data[0] == 0x47 &&
            data[1] == 0x49 &&
            data[2] == 0x46 &&
            data[3] == 0x38 &&
            (data[4] == 0x37 || data[4] == 0x39) &&
            data[5] == 0x61)
        {
            return RESULT_GIF;
        }
    }

    return RESULT_UNKNOWN;
}

int detect_tiff(uint8_t *data, uint32_t len)
{
    if (len > 3)
    {
        if (data[0] == 0x49 &&
            data[1] == 0x49 &&
            data[2] == 0x2a &&
            data[3] == 0x00)
        {
            return RESULT_TIFF;
        }
        if (data[0] == 0x4d &&
            data[1] == 0x4d &&
            data[2] == 0x00 &&
            data[3] == 0x2a)
        {
            return RESULT_TIFF;
        }
    }

    return RESULT_UNKNOWN;
}

int detect_pdf(uint8_t *data, uint32_t len)
{
    if (len > 4)
    {
        if (data[0] == 0x25 &&
            data[1] == 0x50 &&
            data[2] == 0x44 &&
            data[3] == 0x46 &&
            data[4] == 0x2d)
        {
            return RESULT_PDF;
        }
    }

    return RESULT_UNKNOWN;
}

int detect_wav(uint8_t *data, uint32_t len)
{
    if (len > 11)
    {
        if (data[0] == 0x52 &&
            data[1] == 0x49 &&
            data[2] == 0x46 &&
            data[3] == 0x46 &&
            data[8] == 0x57 &&
            data[9] == 0x41 &&
            data[10] == 0x56 &&
            data[11] == 0x45)
        {
            return RESULT_WAV;
        }
    }

    return RESULT_UNKNOWN;
}

int detect_utf8(uint8_t *data, uint32_t len)
{
    uint32_t i = 0;
    uint32_t asciiCount = 0;
    uint8_t byte;

    if (len > 8)
    {
        for (i = 0; i < min(len, 1024); i++)
        {
            byte = data[i];
            if ((byte >= 32 && byte <= 126) || byte == 10 || byte == 13)
            {
                asciiCount++;
            }
        }
        if ((float)asciiCount / (float)len > 0.75)
        {
            return RESULT_ASCII;
        }
    }

    return RESULT_UNKNOWN;
}

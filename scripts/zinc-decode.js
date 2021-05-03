const sharp = require('sharp');

const blockWidth = 8;
const blockHeight = 8;
const bytesPerPixel = 3;

const image = sharp('./data/zinc.jpg');

image.metadata().then(({ width, height }) => {
    image
        .raw()
        .toBuffer()
        .then(data => {
            const bytes = [];
            const centerY = Math.round(blockHeight / 2);
            const centerX = Math.round(blockWidth / 2);
            for (let y = centerY; y < height; y += blockHeight) {
                for (let x = centerX; x < width; x += blockWidth) {
                    const pos = (y * width + x) * bytesPerPixel;
                    // console.log(data[pos].toString(16).padStart(2, '0'))
                    bytes.push(data[pos])
                }
            }
            console.log(bytes.map(byte => String.fromCharCode(byte)).join(''))
        });
});

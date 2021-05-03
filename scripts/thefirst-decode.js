var PNG = require('png-js');

const W = 199;
const H = 2048;
const BLOCKWIDTH = W / 64;
const BLOCKHEIGHT = H / 660;

PNG.decode('data/thefirst.png', function (pixels) {
    let bit = 7;
    let value = 0;
    let values = [];
    for (let y = 0; y < H; y += BLOCKHEIGHT) {
        for (let x = 0; x < W; x += BLOCKWIDTH) {
            const xPos = Math.round(x);
            const yPos = Math.round(y);
            const w = Math.round(x + BLOCKWIDTH) - xPos;
            const h = Math.round(y + BLOCKHEIGHT) - yPos;

            let avgColor = 0;
            for (let yb = 0; yb < h; yb++) {
                for (let xb = 0; xb < w; xb++) {
                    const pb = (yPos + yb) * W + (xPos + xb);
                    avgColor += pixels[pb * 4];
                }
            }
            avgColor /= (w * h);

            const b = avgColor < 128 ? 1 : 0;
            value |= b << bit;

            if (--bit < 0) {
                values.push(value);
                value = 0;
                bit = 7;
            }
        }
    }

    console.log(values.map(v => String.fromCharCode(v)).join(''));
});

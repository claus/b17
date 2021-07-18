const fs = require('fs');
const fetch = require('node-fetch');

async function test() {
    const len = 2;
    const total = Math.pow(26, len);
    for (let i = 0; i < total; i++) {
        const base26 = i.toString(26).padStart(len, '0');
        const word = base26
            .split('')
            .map(c => {
                let d = c.charCodeAt(0);
                d += (d < 97) ? 49 : 10;
                return String.fromCharCode(d);
            })
            .join('');
        const url = `http://localhost:3100/api/outguess?key=${word}`;
        const response = await fetch(url);
        const result = await response.json();
        result.forEach(r => {
            if (typeof r.code === 'undefined') {
                console.log(r);
            }
        });
    }
}

test();

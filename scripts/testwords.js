const fs = require('fs');
const fetch = require('node-fetch');

async function test() {
    const wordsRaw = fs.readFileSync('./data/strassen.txt', {
        encoding: 'utf8',
    });
    const words = wordsRaw.split('\n');
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const url = `http://localhost:3100/api/outguess?key=${word},switzerland,zurich&removeAccents=1&removeNonAlphaNum=1`;
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

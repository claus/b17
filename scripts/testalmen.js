const fs = require('fs');
const fetch = require('node-fetch');

async function test() {
    const almenRaw = fs.readFileSync('./data/ch-almen.txt', {
        encoding: 'utf8',
    });
    const lines = almenRaw.split('\n');
    const almen = [];
    let pickNextLineWithContent = true;
    let findEmptyLine = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const hasContent = line.length > 0;
        if (hasContent) {
            if (pickNextLineWithContent) {
                pickNextLineWithContent = false;
                findEmptyLine = true;
                console.log(line)
                almen.push(line);
            }
        } else if(findEmptyLine) {
            findEmptyLine = false;
            pickNextLineWithContent = true;
        }
    }
    for (let i = 0; i < almen.length; i++) {
        const alm = almen[i];
        const url = `http://localhost:3100/api/outguess?key=${alm},switzerland`;
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

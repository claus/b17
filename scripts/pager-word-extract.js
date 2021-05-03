const fs = require('fs');
const fetch = require('node-fetch');

function uniq(a) {
    var seen = {};
    return a.filter(item => {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

async function test() {
    const text = fs.readFileSync('./data/pager.txt', {
        encoding: 'utf8',
    });
    const lines = text.split('\n');
    const words = uniq(
        lines
            .map(line => {
                line = line.replace(/(P̷a̵g̴e̶r̴ ̵M̶e̸s̴s̵a̴g̷e̴:̶|Pager Message:)/, '');
                line = line.replace(/Notice:/, '');
                line = line.replace(/deepdive — \d\d\/\d\d\/\d\d\d\d/, '');
                line = line.replace(/[^a-zA-Z0-9 ]/g, '');
                return line
                    .split(' ')
                    .filter(word => word.length > 3 && word.length < 20);
            })
            .flat()
    ).sort();

    for (let i = 0; i < words.length; i++) {
        const word = words[i];
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

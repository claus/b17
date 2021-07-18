const fs = require('fs');
const fetch = require('node-fetch');

async function test() {
    const citiesRaw = fs.readFileSync('./data/ch-cities.txt', {
        encoding: 'utf8',
    });
    const cities = citiesRaw.split('\n')
    for (let i = 0; i < cities.length; i++) {
        const city = cities[i];
        const url = `http://localhost:3100/api/outguess?key=${city},schweiz`;
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

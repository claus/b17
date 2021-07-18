const fs = require('fs');
const fetch = require('node-fetch');

function format(num) {
    return num < 10 ? `0${num}` : num;
}

// Jan 1 1988 00:00:00 Z

async function test() {
    const startdate = new Date('Jan 1 2006 00:00:00 Z')
    const timestamp = startdate.getTime();

    for (let day = 0; day < 366 * 8; day++) {
        console.log(new Date(timestamp + 60000 * 60 * 24 * day));
        for (let minutes = 0; minutes < 12 * 60; minutes++) {
            const ms = timestamp + 60000 * 60 * 24 * day + 60000 * minutes;
            const date = new Date(ms);
            const chour = date.getUTCHours();
            const cminute = date.getUTCMinutes();
            const cday = date.getUTCDate();
            const cmonth = date.getUTCMonth() + 1;
            const cyear = date.getUTCFullYear();
            const key = `${format(chour)}${format(cminute)}${format(cday)}${format(cmonth)}${cyear}`;
            const url = `http://localhost:3100/api/outguess?key=${key}`;
            const response = await fetch(url);
            const result = await response.json();
            result.forEach(r => {
                if (typeof r.code === 'undefined') {
                    console.log(r);
                }
            });
        }
    }
}

test();

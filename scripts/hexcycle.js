const hex = 'db ce dd 6d ae fa dd ba bc b1 c7 61 db 8e f1';
const parsed = hex.split(' ').map(h => parseInt(h, 16))
const min = Math.min.apply(Math.min, parsed);
console.log(parsed);
console.log(min)
for (let i = min, j = 0; i >= 0; i--, j++) {
    console.log(parsed.map(c => String.fromCharCode(c - j)).join(''));
    // console.log(parsed.map(c => (c - j).toString(16)).join(' '));
}

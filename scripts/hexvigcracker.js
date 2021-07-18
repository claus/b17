const cipher = `64 48 64 6g 61 47 56 35 4c 33 5h 6q 64 47 39 6g 59 32 68 76 64 57 4g 6m 5o 57 52 33 5e 58 52 6h 5h 58 4s 6j 62 32 56 6c 61 47 39 79 5h 57 35 76 64 32 56 33 64 47 68 6q 63 32 56 6e 61 47 39 6h 62 33 4h 6q 63 6i 64 6e 64 57 35 7h 64 47 56 6o 61 47 39 6j 63 6f 39 31 5h 32 68 30 61 47 56 74`;

const potentialSolutions = vigeneredHexSolver(cipher);
console.log(potentialSolutions);

function modulo(a, b) {
    return ((a % b) + b) % b;
}

function vigeneredHexSolver(cipher) {
    const letters = cipher
        .toLowerCase()
        .split('')
        .filter(c => c >= 'a' && c <= 'z');

    const letterCodes = letters.map(c => c.charCodeAt(0) - 97);

    const combinations = letterCodes.map(letter =>
        new Array(6)
            .fill(0)
            .map((_, i) => String.fromCharCode(modulo(letter - i, 26) + 97))
    );

    const combinationKeyLens = combinations.map((combination, i) => {
        return combination
            .map(c => {
                const keylens = [];
                for (let keylen = 2; keylen <= 13; keylen++) {
                    if (keylen + i >= combinations.length) {
                        continue;
                    }
                    let possible = true;
                    for (
                        let j = keylen + i;
                        j < combinations.length;
                        j += keylen
                    ) {
                        if (!combinations[j].includes(c)) {
                            possible = false;
                            break;
                        }
                    }
                    if (possible) {
                        keylens.push(keylen);
                    }
                }
                return { letter: c, keylens };
            })
            .filter(({ keylens }) => keylens.length > 0);
    });

    const potentialSolutions = [];
    for (let keylen = 2; keylen <= 13; keylen++) {
        const wordCombinations = [];
        for (let i = 0; i < keylen; i++) {
            const combinations = combinationKeyLens[i];
            const letters = [];
            wordCombinations.push(letters);
            combinations.forEach(({ letter, keylens }) => {
                if (keylens.includes(keylen)) {
                    letters.push(letter);
                }
            });
        }
        if (!wordCombinations.find(letters => letters.length === 0)) {
            potentialSolutions.push(wordCombinations);
        }
    }

    return potentialSolutions;
}

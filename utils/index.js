export function cleanUrl(url) {
    // https://media.discordapp.net/attachments/744267716365385729/834342248203943956/Syphon-Signal-Registered-XIIXVIIXVIIXVVI.jpg?width=1380&height=1840
    const discord = url.match(
        /https:\/\/media.discordapp.net\/attachments\/.*(\?width=\d+&height=\d+)/
    );
    if (discord) {
        return url.replace(discord[1], '');
    }
    return url;
}

function combinations(arr) {
    var fn = function (active, rest, a) {
        if (active.length === 0 && rest.length === 0) {
            return;
        }
        if (rest.length === 0) {
            a.push(active);
        } else {
            fn([...active, rest[0]], rest.slice(1), a);
            fn(active, rest.slice(1), a);
        }
        return a;
    };
    return fn([], arr, []);
}

function permutator(inputArr) {
    const result = [];
    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                const curr = arr.slice();
                const next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next));
            }
        }
    };
    combinations(inputArr).forEach(arr => permute(arr));
    return result;
}

export function permutations(input) {
    const rawKeys = input.slice(0, 7).filter(key => key?.length > 0);
    const keys = permutator(rawKeys).map(key => key.join(''));
    return keys;
}

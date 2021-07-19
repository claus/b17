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
    const rawKeys = input
        .split(',')
        .map(rawKey => rawKey.replace(/\s+/g, '').toLowerCase())
        .slice(0, 7);
    const keys = permutator(rawKeys).map(key => key.join(''));
    return keys;
}

export function detectFileType(bytes) {
    if (bytes.byteLength >= 16) {
        // JPEG
        if (bytes[0] === 0xff && bytes[1] === 0xd8) {
            if (bytes[2] === 0xff && bytes[3] === 0xdb) {
                return { mime: 'image/jpeg', ext: 'jpg', bytes };
            }
            if (bytes[2] === 0xff && bytes[3] === 0xee) {
                return { mime: 'image/jpeg', ext: 'jpg', bytes };
            }
            if (
                bytes[2] === 0xff &&
                bytes[3] === 0xe0 &&
                bytes[4] === 0x00 &&
                bytes[5] === 0x10 &&
                bytes[6] === 0x4a &&
                bytes[7] === 0x46 &&
                bytes[8] === 0x49 &&
                bytes[9] === 0x46 &&
                bytes[10] === 0x00 &&
                bytes[11] === 0x01
            ) {
                return { mime: 'image/jpeg', ext: 'jpg', bytes };
            }
            if (
                bytes[2] === 0xff &&
                bytes[3] === 0xe1 &&
                bytes[6] === 0x45 &&
                bytes[7] === 0x78 &&
                bytes[8] === 0x69 &&
                bytes[9] === 0x66 &&
                bytes[10] === 0x00 &&
                bytes[11] === 0x00
            ) {
                return { mime: 'image/jpeg', ext: 'jpg', bytes };
            }
        }

        // PNG
        if (
            bytes[0] === 0x89 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x4e &&
            bytes[3] === 0x47 &&
            bytes[4] === 0x0d &&
            bytes[5] === 0x0a &&
            bytes[6] === 0x1a &&
            bytes[7] === 0x0a
        ) {
            return { mime: 'image/png', ext: 'png', bytes };
        }

        // GIF
        if (
            bytes[0] === 0x47 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x38 &&
            (bytes[4] === 0x37 || bytes[4] === 0x39) &&
            bytes[5] === 0x61
        ) {
            return { mime: 'image/gif', ext: 'gif', bytes };
        }

        // TIFF
        if (
            bytes[0] === 0x49 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x2a &&
            bytes[3] === 0x00
        ) {
            return { mime: 'image/tiff', ext: 'tiff', bytes };
        }
        if (
            bytes[0] === 0x4d &&
            bytes[1] === 0x4d &&
            bytes[2] === 0x00 &&
            bytes[3] === 0x2a
        ) {
            return { mime: 'image/tiff', ext: 'tiff', bytes };
        }

        // PDF
        if (
            bytes[0] === 0x25 &&
            bytes[1] === 0x50 &&
            bytes[2] === 0x44 &&
            bytes[3] === 0x46 &&
            bytes[4] === 0x2d
        ) {
            return { mime: 'application/pdf', ext: 'pdf', bytes };
        }

        // WAV
        if (
            bytes[0] === 0x52 &&
            bytes[1] === 0x49 &&
            bytes[2] === 0x46 &&
            bytes[3] === 0x46 &&
            bytes[8] === 0x57 &&
            bytes[9] === 0x41 &&
            bytes[10] === 0x56 &&
            bytes[11] === 0x45
        ) {
            return { mime: 'audio/wav', ext: 'wav', bytes };
        }

        let asciiCount = 0;
        for (let i = 0; i < Math.min(bytes.byteLength, 1024); i++) {
            const byte = bytes[i];
            if ((byte >= 32 && byte <= 126) || byte === 10 || byte === 13) {
                asciiCount++;
            }
        }
        if (asciiCount / bytes.byteLength > 0.75) {
            return { mime: 'text/plain', ext: 'txt', bytes };
        }
    }
    return null;
}

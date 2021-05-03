const { spawn } = require('child_process');
const fileGuesser = require('guess-file-type');
const tmp = require('tmp');
const fs = require('fs');
const utf8 = require('utf8');
const accents = require('remove-accents');

const OUTGUESS_APP = '/Applications/Outguess.app/Contents/outguess';
const WORK_DIR = '/Users/claus/Projects/building17/public/data/';
const VERBOSE = true;

const jpegHeader = Buffer.from([0xff, 0xd8]);
const pngHeader = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const mp3aHeader = Buffer.from([0x49, 0x44, 0x33]);
const mp3bHeader = Buffer.from([0xff, 0xfb]);
const gifaHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x37, 0x61]);
const gifbHeader = Buffer.from([0x47, 0x49, 0x46, 0x38, 0x39, 0x61]);

const knownMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'audio/mpeg',
    'unknown',
];

export default async (req, res) => {
    if (req.query?.key?.length > 0) {
        const removeAccents = req.query?.removeAccents == 1;
        const removeNonAlphaNum = req.query?.removeNonAlphaNum == 1;
        const allKeys = permutations(req.query.key)
            .flat()
            .filter((key, i, arr) => key !== '' && arr.indexOf(key) == i)
            .map(key => (removeAccents ? accents.remove(key) : key))
            .map(key => removeNonAlphaNum ? key.replace(/[^a-zA-Z0-9]/g, '') : key);
        if (allKeys.length > 64) {
            res.status(400).json({ error: '4 components allowed max.' });
            return;
        }
        const filename =
            req.query?.filename ??
            'Syphon-Signal-Registered-XIIXVIIXVIIXVVI.jpg';
        const results = await outguessAll(allKeys, filename);
        res.status(200).json(results);
    } else {
        res.status(400).json({ error: 'Key is empty or missing.' });
    }
};

async function outguessAll(keys, filename) {
    const results = [];
    for (let i = 0; i < keys.length; i++) {
        const result = await outguess(keys[i], filename);
        results.push(result);
    }
    return results;
}

function outguess(key, filename) {
    const promise = new Promise((resolve, reject) => {
        const out = tmp.fileSync();
        const source = `${WORK_DIR}${decodeURIComponent(filename)}`;
        const child = spawn(OUTGUESS_APP, ['-k', key, '-r', source, out.name]);
        const moveAndResolve = (mime, ext) => {
            const filename = `${key}.${ext}`;
            const path = `${WORK_DIR}files/${filename}`;
            fs.renameSync(out.name, path);
            resolve({ key, mime, file: filename });
        };
        child.on('close', async code => {
            const buffer = fs.readFileSync(out.name);
            if (buffer.length > 0) {
                // 1. Check for text content
                try {
                    const decoder = new TextDecoder('utf-8', { fatal: true });
                    const string = decoder.decode(buffer);
                    moveAndResolve('text/plain', 'txt');
                    return;
                } catch (e) {}
                // 2. Check for some known formats (jpeg, png, mp3, gif)
                const slice = buffer.slice(0, 32);
                if (slice.indexOf(jpegHeader, 0) === 0) {
                    moveAndResolve('image/jpeg', 'jpg');
                    return;
                }
                if (slice.indexOf(pngHeader, 0) === 0) {
                    moveAndResolve('image/png', 'png');
                    return;
                }
                if (slice.indexOf(mp3aHeader, 0) === 0) {
                    moveAndResolve('audio/mpeg', 'mp3');
                    return;
                }
                if (slice.indexOf(mp3bHeader, 0) === 0) {
                    moveAndResolve('audio/mpeg', 'mp3');
                    return;
                }
                if (slice.indexOf(gifaHeader, 0) === 0) {
                    moveAndResolve('image/gif', 'gif');
                    return;
                }
                if (slice.indexOf(gifbHeader, 0) === 0) {
                    moveAndResolve('image/gif', 'gif');
                    return;
                }
                // 3. Check for any other content
                const mime = await fileGuesser.guessByFileSignature(out.name);
                if (mime != null && !knownMimes.includes(mime)) {
                    const ext = fileGuesser.getExtensionFromMime(mime);
                    moveAndResolve(mime, ext);
                    return;
                }
            }
            out.removeCallback();
            reject({ key, code });
        });
    });
    return promise
        .then(result => {
            const time = new Date().toTimeString().substr(0, 8);
            console.log(
                `🎉 ${time} ${result.key}: ${result.file} (${result.mime}) 🎉🎉🎉`
            );
            return result;
        })
        .catch(e => {
            const time = new Date().toTimeString().substr(0, 8);
            VERBOSE && console.log(`⛔️ ${time} ${e.key}`);
            return e;
        });
}

function permutations(input) {
    const rawKeys = input
        .split(',')
        .map(rawKey => rawKey.replace(/\s+/g, '').toLowerCase());
    const keys = permutator(rawKeys).map(key => key.join(''));
    return keys;
}

function permutator(inputArr) {
    const result = [];
    const permute = (arr, m = []) => {
        if (arr.length === 0) {
            result.push(m);
        } else {
            for (let i = 0; i < arr.length; i++) {
                let curr = arr.slice();
                let next = curr.splice(i, 1);
                permute(curr.slice(), m.concat(next));
            }
        }
    };
    combinations(inputArr).forEach(arr => permute(arr));
    return result;
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

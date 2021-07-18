import fs from 'fs';
import path from 'path';

const WORK_DIR = '/Users/claus/Projects/building17/public/data/obs/';

function errorResponse(code, res) {
    res.writeHead(code, { 'Content-Type': 'text/html' });
    res.write(`<h1>${code}</h1>`);
    res.end();
}

const downloadAPI = async (req, res) => {
    const time = new Date().toTimeString().substr(0, 8);
    if (req.query?.filename?.length > 0) {
        let filename;
        try {
            const pathname = decodeURIComponent(req.query.filename);
            const pathnameSafe = path
                .normalize(pathname)
                .replace(/^(\.\.(\/|\\|$))+/, '');
            filename = path.basename(pathnameSafe);
            const file = path.join(WORK_DIR, 'files', filename);
            if (fs.existsSync(file)) {
                console.log(`⬇️  ${time} Downloading ${filename}`);
                res.setHeader(
                    'content-disposition',
                    'attachment; filename=' + filename
                );
                const stream = fs.createReadStream(file);
                stream.on('open', () => {
                    stream.pipe(res);
                });
            } else {
                console.log(`⬇️  ${time} Downloading ${filename} [NOT FOUND]`);
                errorResponse(404, res);
            }
        } catch (e) {
            console.log(`⬇️  ${time} Downloading ${filename} [500]`);
            errorResponse(500, res);
        }
    } else {
        console.log(`⬇️  ${time} Downloading [400]`);
        errorResponse(400, res);
    }
};

export default downloadAPI;

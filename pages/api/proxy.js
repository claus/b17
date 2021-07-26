const proxy = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const response = await fetch(req.body);
            if (response.status < 400) {
                const arrayBuffer = await response.arrayBuffer();
                const buffer = new Buffer(arrayBuffer);
                if (
                    buffer.length >= 2 &&
                    buffer[0] == 0xff &&
                    buffer[1] == 0xd8
                ) {
                    const url = new URL(req.body);
                    const pathParts = url.pathname.split('/');
                    const fileName = pathParts[pathParts.length - 1];
                    res.setHeader(
                        'Content-Disposition',
                        `attachment; filename="${fileName}"`
                    );
                    res.status(200).send(buffer);
                } else {
                    res.status(403).send(`The downloaded file is not a JPEG.`);
                }
            } else {
                res.status(403).send(
                    `Error loading JPEG (${response.status}).`
                );
            }
        } catch (error) {
            res.status(403).send(error.message);
        }
        return;
    }
    res.status(405).send('Method not allowed (405).');
};

export default proxy;

const proxy = async (req, res) => {
    if (req.method === 'POST') {
        console.log('#', req.body);
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
                    res.setHeader(
                        'x-whatever',
                        `hello`
                    );
                    console.log(res.getHeaders())
                    res.status(200).send(buffer);
                } else {
                    res.status(403).send(`Not a JPEG.`);
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
    res.status(405).json({ error: '405 Method not allowed.' });
};

export default proxy;

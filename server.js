require('dotenv').config();
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const port = parseInt(process.env.PORT, 10) || 3008;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const httpsOptions = {
    key: fs.readFileSync(dev ? 'mylocal.key' : 'occo.key', 'utf8').toString(),
    cert: fs.readFileSync(dev ? 'mylocal.crt' : 'occo.crt', 'utf8').toString(),
    // passphrase: 'nest-aknan-app', // Replace with your actual passphrase
};
app.prepare().then(() => {
    createServer(httpsOptions, (req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    }).listen(port, (err) => {
        if (err) throw err;
        console.log(`> Server started on ${process.env.NEXTAUTH_URL}`);
    });
});

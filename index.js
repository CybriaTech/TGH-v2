/* eslint-disable @typescript-eslint/no-var-requires */
const http = require('node:http');
const { createBareServer } = require('@tomphttp/bare-server-node');
const url = require('node:url');
const fs = require('node:fs');
const path = require('node:path');

function ismua(userAgent) {
    return /mobile/i.test(userAgent);
}

function ssf(res, filePath, contentType) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const httpServer = http.createServer();
const bareServer = createBareServer('/');

httpServer.on('request', (req, res) => {
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    if (ismua(req.headers['user-agent'])) {
        if (pathname !== '/static/mobile.html') {
            res.writeHead(302, { Location: '/static/mobile.html' });
            res.end();
            return;
        }
    }

    if (!pathname.startsWith('/static')) {
        pathname = `/static${pathname}`;
    }

    if (bareServer.shouldRoute(req)) {
        req.url = pathname;
        bareServer.routeRequest(req, res);
    } else {
        const filePath = path.join(__dirname, 'static', '404.html');
        ssf(res, filePath, 'text/html');
    }
});

httpServer.on('upgrade', (req, socket, head) => {
    if (bareServer.shouldRoute(req)) {
        bareServer.routeUpgrade(req, socket, head);
    } else {
        socket.end();
    }
});

httpServer.on('listening', () => {
    console.log('TGH is online');
});

httpServer.listen({
    port: 8080,
});

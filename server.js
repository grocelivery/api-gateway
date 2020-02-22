require('dotenv').config();

const PORT = process.env.PORT;

const http = require('http');
const httpProxy = require('http-proxy');
const services = require('./serviceRegistry').services;

const proxy = httpProxy.createProxyServer({});

const server = http.createServer(function(request, response) {

    let requestedPrefix = request.url.split('/')[1];
    let targetPath = request.url.split(requestedPrefix)[1];

    let selectedService = services.find(function (service) {
        return service.prefix === requestedPrefix
    });

    if (!selectedService) {
        response.writeHead(404, {'Content-Type': 'application/json'});
        response.write('{"error": "Not found"}');
        response.end();
        return;
    }

    request.url = targetPath;

    proxy.web(request, response, {
        target: selectedService.target,
        changeOrigin: true,
    });
});

server.listen(PORT);

console.log(`API Gateway is listening on port: ${PORT}`);
const helloRoutes = require('./hello.route');
const many2manyRoutes = require('./many2many.route');
const videoChatRoutes = require('./videochat.route');

const routes = [
    helloRoutes,
    many2manyRoutes,
    // videoChatRoutes,
];

module.exports = routes;

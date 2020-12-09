const helloRoutes = require('./hello.route');
const one2oneRoutes = require('./one2one.route');
const videoChatRoutes = require('./videochat.route');
const loopbackRoutes = require('./loopback.route');
const broadcastRoutes = require('./broadcast.route');
const many2manyRoutes = require('./many2manyRoutes.route');

const routes = [
    helloRoutes,
    one2oneRoutes,
    // videoChatRoutes,
    // loopbackRoutes,
    // broadcastRoutes,
    // many2manyRoutes
];

module.exports = routes;

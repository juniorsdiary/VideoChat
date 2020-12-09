const { SocketEndpoint } = require('../utils/SocketEndpoint');
const controller = require('../controllers/loopback.controller');

const router = new SocketEndpoint('loopback:');

router.addRoute(
    { path: 'initiateConnection' },
    controller.initiateConnection,
);

router.addRoute(
    { path: 'onIceCandidate' },
    controller.onIceCandidate,
);

module.exports = router;

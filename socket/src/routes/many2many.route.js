const { SocketEndpoint } = require('../utils/SocketEndpoint');
const controller = require('../controllers/many2many.controller');

const router = new SocketEndpoint('many2many:');

router.addRoute(
    { path: 'createRoom' },
    controller.createRoom,
);

router.addRoute(
    { path: 'joinRoom' },
    controller.joinRoom,
);

router.addRoute(
    { path: 'disconnect' },
    controller.disconnect,
);

router.addRoute(
    { path: 'onIceCandidate' },
    controller.onIceCandidate,
);

router.addRoute(
    { path: 'sendOffer' },
    controller.sendOffer,
);

router.addRoute(
    { path: 'userConnected' },
    controller.userConnected,
);

router.addRoute(
    { path: 'getCurrentUsers' },
    controller.getCurrentUsers,
);

module.exports = router;

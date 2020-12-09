const { SocketEndpoint } = require('../utils/SocketEndpoint');
const controller = require('../controllers/one2one.controller');

const router = new SocketEndpoint('one2one:');

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
    { path: 'connectToUser' },
    controller.connectToUser,
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

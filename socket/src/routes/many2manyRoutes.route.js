const { SocketEndpoint } = require('../utils/SocketEndpoint');
const controller = require('../controllers/many2many.controller');

const router = new SocketEndpoint('many2many:');

router.addRoute(
    { path: 'joinRoom' },
    controller.joinRoom,
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
    { path: 'sendAnswer' },
    controller.sendAnswer,
);

module.exports = router;
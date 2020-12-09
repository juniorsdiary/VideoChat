const { SocketEndpoint } = require('../utils/SocketEndpoint');
const controller = require('../controllers/videochat.controller');

const router = new SocketEndpoint('videochat:');

router.addRoute(
    { path: 'joinRoom' },
    controller.joinRoom,
);

router.addRoute(
    { path: 'getUsersList' },
    controller.getUsersList,
);

router.addRoute(
    { path: 'sendOffer' },
    controller.sendOffer,
);

router.addRoute(
    { path: 'sendAnswer' },
    controller.sendAnswer,
);

router.addRoute(
    { path: 'sendICE' },
    controller.sendICE,
);

router.addRoute(
    { path: 'disconnect' },
    controller.onLeave,
);

module.exports = router;

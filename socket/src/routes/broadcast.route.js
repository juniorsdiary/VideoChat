const { SocketEndpoint } = require('../utils/SocketEndpoint');
const controller = require('../controllers/broadcast.controller');

const router = new SocketEndpoint('broadcast:');

router.addRoute(
    { path: 'startPresenter' },
    controller.startPresenter,
);

router.addRoute(
    { path: 'startViewer' },
    controller.startViewer,
);

router.addRoute(
    { path: 'onIceCandidate' },
    controller.onIceCandidate,
);

module.exports = router;

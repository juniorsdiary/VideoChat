const { SocketEndpoint } = require('../utils/SocketEndpoint');
// const controller = require('../controllers/socket/hello.controller');

const router = new SocketEndpoint('hello:');

router.addRoute(
    { path: 'world' },
    (socketTransport, data, cb) => {
        console.log('hello:world', data);
        if (cb) cb({ hello: 'world' })
    },
);

module.exports = router;

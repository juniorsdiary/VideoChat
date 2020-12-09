// eslint-disable-next-line no-global-assign
Promise = require('bluebird');
const http = require('http');
const socket = require('socket.io');

const { port, env } = require('./config/vars');
const { SocketGateway } = require('./utils/SocketGateway');
const routes = require('./routes');
const logger = require('./utils/logger');
const { connectRedis } = require('./connections/connectRedis');
const { wrapWithCatch } = require('./utils/wrappers/wrapWithCatch');

const start = async () => {
    try {
        await connectRedis();
        const io = socket({
            server: {
                pingInterval: 10000,
                pingTimeout: 10000,
            },
        });
        io.on('connection', wrapWithCatch((socket) => new SocketGateway(io, socket, routes)));
        io.listen(port, () => {
            logger.info(`Socket server started on port ${port} (${env})`);
        });
    } catch (e) {
        logger.log(e.message);
        process.exit();
    }
};

start().then(() => {
    logger.info("Socket service has started");
});

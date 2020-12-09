const logger = require('../utils/logger');

class ChatInstance {
    constructor() {
        this.users = {};
        this.pipeline = null;
    }

    registerUser(socketId, user) {
        this.users[socketId] = { id: socketId, ...user };
    }

    updateUserData({ id, offer }) {
        return this.users[id];
    }

    updateUserMedia({ id, mainUserEndPoint }) {
        this.users[id].mainUserEndPoint = mainUserEndPoint;
        this.users[id].senderEndPoints = [];
    }

    getUser(id) {
        return this.users[id];
    }

    getUsersArray() {
        return Object.values(this.users);
    }

    removeUser(id) {
        delete this.users[id];
    }

    updateSenderEndpoints = ({id, senderId, senderEndPoint}) => {
        const endpoints = this.users[id].senderEndPoints;

        this.users[id].senderEndPoints = [...endpoints, { id: senderId, endpoint: senderEndPoint }];
    }
    releaseEndPoints = (id) => {
        const user = this.users[id];
        logger.info('release main user endpoint', id);

        user.mainUserEndPoint.release();

        Object.values(this.users).forEach(userData => {
            const relatedEndPoint = userData.senderEndPoints.find(endpointData => endpointData.id === id);

            if (relatedEndPoint) {
                logger.info('release endpoint', `${id} => ${relatedEndPoint.id}`);
                relatedEndPoint.endpoint.release();
            }

            userData.senderEndPoints.filter(endpointData => endpointData.id !== id);
        })
    }
}

const getNewInstance = () => new ChatInstance();

exports.getNewInstance = getNewInstance;

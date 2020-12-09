const { setValue, getValue, removeValue } = require('../models/redis/common');
const logger = require('../utils/logger');

const uuid = require('uuid');

const candidatesQueue = {};
const sessions = {};

const {
    getCandidate, createEndPoints, onIceCandidateController, clearCandidatesQueue, generateSdpAnswer, addCandidates, generatePipeline,
} = require('../helpers/kurentoHelpers');
const { getNewInstance } = require('../helpers/One2OneHelper');

const ChatInstance = getNewInstance();

const createRoom = async (socketTransport, data, cb) => {
    logger.info('createRoom', data);
    const roomId = uuid.v4();

    const newRoom = {
        roomId,
        roomName: data.roomName,
        users: []
    };

    await setValue(roomId, newRoom);

    if (cb) cb({ result: newRoom });
}

const joinRoom = async (socketTransport, data, cb) => {
    logger.info('joinRoom', data);
    try {
        socketTransport.joinRoom(data.roomId);

        const updatedUser = {
            roomId: data.roomId,
            socketId: socketTransport.id,
        };

        await setValue(updatedUser.socketId, updatedUser);

        const room = await getValue(data.roomId);

        const updatedRoom = {
            ...room,
            users: [...room.users, updatedUser]
        }

        await setValue(data.roomId, updatedRoom);

        ChatInstance.registerUser(socketTransport.id, updatedUser);

        let pipeline = ChatInstance.pipeline;

        if (!pipeline) {
            ChatInstance.pipeline = await generatePipeline();
        }

        await createMainUserEndPoint(socketTransport);

        socketTransport.sendToOthersInRoom(
            data.roomId,
            'many2many:availableUsers',
            updatedRoom.users
        );

        if (cb) {
            cb({ result: updatedRoom });
        }
    } catch (e) {
        console.log(e);
    }
};

const disconnect = async (socketTransport, data) => {
    try {
        logger.info('disconnect', data);
        const user = await getValue(socketTransport.id);
        const room = await getValue(user.roomId);

        await setValue(user.roomId, {
            ...room,
            users: room.users.filter(user => user.socketId !== socketTransport.id),
        });

        ChatInstance.releaseEndPoints(socketTransport.id);
        ChatInstance.removeUser(socketTransport.id);
        await removeValue(socketTransport.id);
        socketTransport.sendToOthersInRoom(
            user.roomId,
            'many2many:userLeft',
            { userId: socketTransport.id }
        );
    } catch (e) {
        logger.error(e.message);
    }
}

const sendOffer = async (socketTransport, { mainUserId, senderId, offer }, cb) => {
    logger.info('sendOffer', { mainUserId, senderId });
    clearCandidatesQueue(socketTransport.id);

    const mediaEndPoint = await getEndpointForUser(socketTransport, ChatInstance.pipeline, mainUserId, senderId);

    if (mediaEndPoint) {
        const sdpAnswer = await generateSdpAnswer(mediaEndPoint, offer.sdp);

        addCandidates(mediaEndPoint, candidatesQueue, mainUserId);

        if (cb) cb({ result: sdpAnswer });
    }
};

const createMainUserEndPoint = async (socket) => {
    clearCandidatesQueue(socket.id);
    const mainUser =  ChatInstance.getUser(socket.id);
    const mainUserEndPoint = await createEndPoints(ChatInstance.pipeline);

    ChatInstance.updateUserMedia({ id: mainUser.id, mainUserEndPoint });

    mainUserEndPoint.on('OnIceCandidate', (event) => {
        const candidate = getCandidate(event.candidate);
        socket.sendToSocket(
            socket.socket,
            'many2many:iceCandidate',
            { userId: socket.id, candidate }
        );
    });
}

const getEndpointForUser = async (socketTransport, pipeline, userId, senderId) => {
    try {
        const mainUser =  ChatInstance.getUser(userId);
        const senderUser = ChatInstance.getUser(senderId);

        if (userId === senderId) {
            return mainUser.mainUserEndPoint;
        }
        const senderEndPoint = await createEndPoints(ChatInstance.pipeline);

        senderEndPoint.on('OnIceCandidate', (event) => {
            const candidate = getCandidate(event.candidate);

            socketTransport.sendToSocket(
                socketTransport.socket,
                'many2many:iceCandidate',
                { userId: socketTransport.id, candidate }
            );
        });

        addCandidates(senderEndPoint, candidatesQueue, mainUser.id);

        ChatInstance.updateSenderEndpoints({ id: mainUser.id, senderId, senderEndPoint });

        senderUser.mainUserEndPoint.connect(senderEndPoint);
        senderEndPoint.connect(senderUser.mainUserEndPoint);

        return senderEndPoint;
    } catch (e) {
        logger.error(e.message);
    }
};

const onIceCandidate = async (socketTransport, message) => {
    await onIceCandidateController(socketTransport.id, message.candidate, candidatesQueue, sessions);
};

const userConnected = (socketTransport, data) => {
    logger.info('userConnected', data);
    const user = ChatInstance.getUser(socketTransport.id);

    socketTransport.sendToOthersInRoom(
        user.roomId,
        'many2many:userConnected',
        { userId: user.socketId }
    );
}

const getCurrentUsers = (socketTransport, data, cb) => {
    try {
        logger.info('getCurrentUsers', data);
        const users = ChatInstance.getUsersArray().map(u => ({ socketId: u.id, roomId: u.roomId }));
        if (cb) cb({ result: users });
    } catch (e) {
        logger.error(e.message)
    }

}

exports.createRoom = createRoom;
exports.joinRoom = joinRoom;
exports.disconnect = disconnect;
exports.sendOffer = sendOffer;
exports.userConnected = userConnected;
exports.onIceCandidate = onIceCandidate;
exports.getCurrentUsers = getCurrentUsers;

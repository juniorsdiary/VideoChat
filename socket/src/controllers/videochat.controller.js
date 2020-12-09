const { setValue, getValue } = require('../models/redis/common');

const joinRoom = async (socketTransport, data) => {
    try {
        socketTransport.joinRoom(data.room);


        const redisRoom = await getValue(room.id);

        let roomData = {};

        const updatedUser = {
            ...user,
            socketId: socketTransport.id,
            roomId: room.id,
        };

        if (redisRoom && redisRoom.users.length) {
            updatedUser.initiator = true;
            roomData = {
                ...redisRoom,
                users: [...redisRoom.users, updatedUser],
            };
        } else {
            updatedUser.initiator = false;
            roomData = {
                ...room,
                users: [updatedUser],
            };
        }

        await setValue(roomData.id, roomData);
        await setValue(updatedUser.socketId, updatedUser);
        socketTransport.sendToRoom(roomData.id, 'videochat:roomDataInfo', { room: roomData });
        socketTransport.sendToSocket(socketTransport.socket, 'videochat:userJoined', { userData: updatedUser });
    } catch (e) {
        console.log(e);
    }
};

const sendOffer = (socketTransport, { callerId, userId, offer }) => {
    socketTransport.sendToSocketId(
        userId,
        'videochat:backOffer',
        { userId, callerId, offer },
    );
};

const sendAnswer = (socketTransport, { callerId, userId, answer }) => {
    socketTransport.sendToSocketId(
        userId,
        'videochat:backAnswer',
        { userId, callerId, answer },
    );
};

const sendICE = (socketTransport, { callerId, userId, candidate }) => {
    socketTransport.sendToSocketId(
        userId,
        'videochat:receiveICE',
        { userId, callerId, candidate },
    );
};

const onLeave = async (socketTransport) => {
    const redisUser = await getValue(socketTransport.id);
    if (redisUser) {
        const redisRoom = await getValue(room.id);
        const newUsers = redisRoom.users.filter((userData) => user.id !== userData.id);
        await setValue(redisRoom.id, { ...redisRoom, users: newUsers });
        const newRoom = await getValue(redisRoom.id);

        socketTransport.sendToRoom(room.id, 'videochat:roomDataInfo', { room: newRoom });
        socketTransport.sendToRoom(room.id, 'videochat:userLeft', { userId: socketTransport.id });
    }
};

const getUsersList = async (socketTransport, data, callback) => {
    const redisUser = await getValue(socketTransport.id);
    if (redisUser) {
        const redisRoom = await getValue(room.id);
        if (callback) callback({ result: { users: redisRoom.users } });
    }
};

exports.joinRoom = joinRoom;
exports.getUsersList = getUsersList;
exports.sendOffer = sendOffer;
exports.sendAnswer = sendAnswer;
exports.sendICE = sendICE;
exports.onLeave = onLeave;

const { setValue, getValue } = require('../models/redis/common');

const candidatesQueue = {};
const sessions = {};

const {
    getCandidate, createEndPoints, onIceCandidateController, clearCandidatesQueue, generateSdpAnswer, addCandidates, generatePipeline,
} = require('../helpers/kurentoHelpers');
const { getNewInstance } = require('../helpers/One2OneHelper');

const ChatInstance = getNewInstance();

const joinRoom = async (socketTransport, data) => {
    try {
        socketTransport.joinRoom(data.room);
        const updatedUser = {
            ...user,
            socketId: socketTransport.id,
        };
        await setValue(updatedUser.socketId, updatedUser);
        const clients = await socketTransport.getClients(data.room);
        const users = clients.map(async (id) => getValue(id));
        const promised = await Promise.all(users);

        ChatInstance.registerUser(socketTransport, updatedUser);

        socketTransport.sendToRoom(data.room, 'common:showUsers', { users: promised });
    } catch (e) {
        console.log(e);
    }
};

const sendOffer = async (socketTransport, { userId, sdpOffer }) => {
    clearCandidatesQueue(socketTransport.id);

    ChatInstance.updateUserData({ id: socketTransport.id, offer: sdpOffer });

    const pipeline = await generatePipeline();

    ChatInstance.initCallerAndCallee(socketTransport.id, userId);

    const caller = ChatInstance.getCaller();

    const callerEndpoint = await createEndPoints(pipeline);

    callerEndpoint.on('OnIceCandidate', (event) => {
        const candidate = getCandidate(event.candidate);
        socketTransport.sendToSocket(socketTransport.socket, 'one2one:iceCandidate', {
            candidate,
        });
    });

    ChatInstance.updateUserMedia({ id: caller.id, pipeline, endpoint: callerEndpoint });

    addCandidates(callerEndpoint, candidatesQueue, caller.id);

    const sdpAnswer = await generateSdpAnswer(callerEndpoint, caller.offer);

    socketTransport.sendToSocket(
        socketTransport.socket,
        'one2one:sendAnswer',
        { id: caller.id, sdpAnswer },
    );

    socketTransport.sendToSocketId(
        userId,
        'one2one:callProposal',
        { id: caller.id },
    );
};

const sendAnswer = async (socketTransport, { offer }) => {
    clearCandidatesQueue(socketTransport.id);
    ChatInstance.updateUserData({ id: socketTransport.id, offer });

    const callee = ChatInstance.getCallee();

    const pipeline = ChatInstance.getMainPipeline();

    const calleeEndpoint = await createEndPoints(pipeline);

    calleeEndpoint.on('OnIceCandidate', (event) => {
        const candidate = getCandidate(event.candidate);
        socketTransport.sendToSocket(socketTransport.socket, 'one2one:iceCandidate', {
            candidate,
        });
    });

    const { endpoint: callerEndpoint } = ChatInstance.getCaller();

    ChatInstance.updateUserMedia({ id: callee.id, pipeline, endpoint: calleeEndpoint });

    addCandidates(calleeEndpoint, candidatesQueue, callee.id);

    callerEndpoint.connect(calleeEndpoint);
    calleeEndpoint.connect(callerEndpoint);

    const sdpAnswer = await generateSdpAnswer(calleeEndpoint, callee.offer);

    socketTransport.sendToSocket(
        socketTransport.socket,
        'one2one:sendAnswer',
        { id: callee.id, sdpAnswer },
    );
};

const onIceCandidate = async (socketTransport, message) => {
    await onIceCandidateController(socketTransport.id, message.candidate, candidatesQueue, sessions);
};


exports.joinRoom = joinRoom;
exports.sendOffer = sendOffer;
exports.sendAnswer = sendAnswer;
exports.onIceCandidate = onIceCandidate;

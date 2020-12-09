const sessions = {};
const candidatesQueue = {};

const {
    getCandidate, generatePipeline, createEndPoints,
    generateSdpAnswer, onIceCandidateController, clearCandidatesQueue, addCandidates,
} = require('../helpers/kurentoHelpers');

async function initiateConnection(socketTransport, { sdpOffer }) {
    try {
        clearCandidatesQueue(socketTransport.id);

        const pipeline = await generatePipeline();

        const webRtcEndPoint = await createEndPoints(pipeline);

        webRtcEndPoint.on('OnIceCandidate', (event) => {
            const candidate = getCandidate(event.candidate);
            socketTransport.sendToSocket(socketTransport.socket, 'loopback:iceCandidate', {
                candidate,
            });
        });

        addCandidates(webRtcEndPoint, candidatesQueue, socketTransport.id);

        webRtcEndPoint.connect(webRtcEndPoint);

        const callerAnswer = await generateSdpAnswer(webRtcEndPoint, sdpOffer);

        sessions[socketTransport.id] = { pipeline, webRtcEndPoint };

        socketTransport.sendToSocket(socketTransport.socket, 'loopback:startResponse', {
            id: 'startResponse',
            sdpAnswer: callerAnswer,
        });
    } catch (e) {
        console.log(e.message);
    }
}

async function onIceCandidate(socketTransport, { candidate }) {
    await onIceCandidateController(socketTransport.id, candidate, candidatesQueue, sessions);
}


exports.initiateConnection = initiateConnection;
exports.onIceCandidate = onIceCandidate;

const kurento = require('kurento-client');

const wsUri = 'ws://192.168.0.101:8888/kurento';
const kurentoClient = null;

const getCandidate = (candidate) => kurento.getComplexType('IceCandidate')(candidate);

const getKurentoClient = async () => {
    if (kurentoClient !== null) {
        return kurentoClient;
    }
    try {
        return await kurento(wsUri);
    } catch (error) {
        console.log(`Could not find media server at address ${wsUri}`);
    }
};

const generateSdpAnswer = async (endpoint, offer) => {
    const answer = await endpoint.processOffer(offer);

    endpoint.gatherCandidates();

    return answer;
};

const createEndPoints = async (pipeline) => {
    const endpoint = await pipeline.create('WebRtcEndpoint');

    return endpoint;
};

const generatePipeline = async () => {
    const kurentoClient = await getKurentoClient();
    return kurentoClient.create('MediaPipeline');
};

function onIceCandidateController(sessionId, _candidate, candidatesQueue, sessions) {
    const candidate = getCandidate(_candidate);
    if (sessions[sessionId]) {
        const { webRtcEndPoint } = sessions[sessionId];
        webRtcEndPoint.addIceCandidate(candidate);
    } else {
        if (!candidatesQueue[sessionId]) {
            candidatesQueue[sessionId] = [];
        }
        candidatesQueue[sessionId].push(candidate);
    }
}

const clearCandidatesQueue = (candidatesQueue, sessionId) => {
    if (candidatesQueue[sessionId]) {
        delete candidatesQueue[sessionId];
    }
};

const addCandidates = (webRtcEndpoint, candidatesQueue, sessionId) => {
    if (candidatesQueue[sessionId]) {
        while (candidatesQueue[sessionId].length) {
            const candidate = candidatesQueue[sessionId].shift();
            webRtcEndpoint.addIceCandidate(candidate);
        }
    }
};

exports.generateSdpAnswer = generateSdpAnswer;
exports.createEndPoints = createEndPoints;
exports.generatePipeline = generatePipeline;
exports.getKurentoClient = getKurentoClient;
exports.clearCandidatesQueue = clearCandidatesQueue;
exports.getCandidate = getCandidate;
exports.addCandidates = addCandidates;
exports.onIceCandidateController = onIceCandidateController;

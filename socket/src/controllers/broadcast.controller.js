const candidatesQueue = {};
const sessions = {};
const { BroadcastInstance } = require('../utils/BroadCastHandler');

const BroadCastHandler = new BroadcastInstance();

const {
    getKurentoClient, onIceCandidateController,
    clearCandidatesQueue, getCandidate, addCandidates,
} = require('../helpers/kurentoHelpers');

const startPresenter = async (socketTransport, sdpOffer) => {
    const sessionId = socketTransport.id;

    clearCandidatesQueue(candidatesQueue, sessionId);

    BroadCastHandler.initPresenter(sessionId);

    const kurentoClient = await getKurentoClient();

    const pipeline = await kurentoClient.create('MediaPipeline');

    const webRtcEndpoint = await pipeline.create('WebRtcEndpoint');

    BroadCastHandler.updatePresenterState(sessionId, pipeline, webRtcEndpoint);

    addCandidates(webRtcEndpoint, candidatesQueue, sessionId);

    webRtcEndpoint.on('OnIceCandidate', (event) => {
        const candidate = getCandidate(event.candidate);
        socketTransport.sendToSocket(socketTransport.socket, 'broadcast:iceCandidate', {
            id: 'iceCandidate',
            candidate,
        });
    });

    const sdpAnswer = await webRtcEndpoint.processOffer(sdpOffer);

    socketTransport.sendToSocket(socketTransport.socket, 'broadcast:presenterResponse', {
        sdpAnswer,
    });

    webRtcEndpoint.gatherCandidates();
};

const startViewer = async (socketTransport, sdpOffer) => {
    const sessionId = socketTransport.id;

    clearCandidatesQueue(candidatesQueue, sessionId);

    const presenter = BroadCastHandler.getPresenter();

    const webRtcEndpoint = await presenter.pipeline.create('WebRtcEndpoint');

    BroadCastHandler.addViewers(sessionId, webRtcEndpoint, socketTransport);

    addCandidates(webRtcEndpoint, candidatesQueue, sessionId);

    webRtcEndpoint.on('OnIceCandidate', (event) => {
        const candidate = getCandidate(event.candidate);
        socketTransport.sendToSocket(socketTransport.socket, 'broadcast:iceCandidate', {
            candidate,
        });
    });

    const sdpAnswer = await webRtcEndpoint.processOffer(sdpOffer);

    socketTransport.sendToSocket(socketTransport.socket, 'broadcast:viewerResponse', {
        sdpAnswer,
    });

    presenter.webRtcEndpoint.connect(webRtcEndpoint);

    webRtcEndpoint.gatherCandidates();
};

async function onIceCandidate(socketTransport, { candidate }) {
    await onIceCandidateController(socketTransport.id, candidate, candidatesQueue, sessions);
}

module.exports = {
    startPresenter,
    startViewer,
    onIceCandidate,
};

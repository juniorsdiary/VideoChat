class BroadcastInstance {
    constructor() {
        this.presenterInstance = {};
        this.viewers = {};
    }

    getPresenter() {
        return this.presenterInstance;
    }

    addViewers(sessionId, webRtcEndpoint, socket) {
        this.viewers[sessionId] = {
            webRtcEndpoint,
            socket,
        };
    }

    initPresenter(sessionId) {
        this.presenterInstance = {
            id: sessionId,
            pipeline: null,
            webRtcEndpoint: null,
        };
        return this.presenterInstance;
    }

    updatePresenterState(sessionId, pipeline, webRtcEndpoint) {
        this.presenterInstance.pipeline = pipeline;
        this.presenterInstance.webRtcEndpoint = webRtcEndpoint;
        return this.presenterInstance;
    }
}

exports.BroadcastInstance = BroadcastInstance;

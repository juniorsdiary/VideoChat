const emptyFunc = (f) => f;

class SocketEndpoint {
    constructor(basePath) {
        this.basePath = basePath;
        this.routes = [];
    }

    addRoute({ path } = {}, ...handlers) {
        this.routes.push([path, handlers]);
    }

    addSocket(socketTransport) {
        this.routes.map(([route, handlers]) => {
            const event = `${this.basePath}${route}`;
            socketTransport.addRoute(event, async (data, cb) => {
                await this.runHandlers({
                    handlers,
                    socketTransport,
                    data,
                    cb: cb || emptyFunc,
                });
            });
        });
    }

    async runHandlers({
        handlers, socketTransport, data, cb,
    }) {
        try {
            for (const h of handlers) {
                await h(socketTransport, data, cb);
            }
        } catch (e) {
            socketTransport.disconnect();
        }
    }
}

exports.SocketEndpoint = SocketEndpoint;

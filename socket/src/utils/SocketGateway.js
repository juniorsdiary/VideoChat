const ss = require('socket.io-stream');

class SocketGateway {
    constructor(io, socket, routes) {
        this.io = io;
        this.id = socket.id;
        this.socket = socket;
        this.init(routes);
    }

    disconnect() {
        this.socket.disconnect(this.socket.id);
    }

    async init(routes) {
        routes.map((route) => {
            route.routes.forEach((route) => {
                if (route[0] === 'disconnect') {
                    this.addRoute('disconnect', route[1][0].bind(null, this));
                }
            });
            route.addSocket(this);
        });
        this.addRoute('disconnect', this.disconnect.bind(this));
    }

    addRoute(event, handler) {
        this.socket.on(event, handler);
    }

    joinRoom(room) {
        this.socket.join(room);
    }

    leaveRoom(room) {
        this.socket.leave(room);
    }

    send(event, data) {
        this.socket.emit(event, data);
    }

    sendToAll(event, data) {
        this.io.emit(event, data);
    }

    sendToRoom(room, event, data) {
        this.io.to(room).emit(event, data);
    }

    // eslint-disable-next-line class-methods-use-this
    sendToSocket(socket, event, data) {
        if (socket) {
            socket.emit(event, data);
        }
    }

    sendToOthers(event, data) {
        this.socket.broadcast.emit(event, data);
    }

    sendToOthersInRoom(room, event, data) {
        this.socket.to(room).emit(event, data);
    }

    sendToSocketId(socketId, event, data) {
        this.socket.broadcast.to(socketId).emit(event, data);
    }

    getRooms() {
        return this.socket.rooms;
    }

    isInRoom(room) {
        const rooms = this.getRooms();
        return Object.keys(rooms).includes(room);
    }

    getClients(room) {
        return new Promise((resolve, reject) => {
            this.io.in(room).clients((err, clients) => {
                if (err) reject(err);
                resolve(clients);
            });
        });
    }
}

exports.SocketGateway = SocketGateway;

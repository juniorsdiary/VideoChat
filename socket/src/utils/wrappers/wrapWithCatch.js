
exports.wrapWithCatch = (func, io) => async (socket) => {
    try {
        await func(socket, io);
    } catch (e) {
        console.error(`\`${e}\``);
        socket.disconnect();
    }
};
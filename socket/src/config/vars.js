module.exports = {
    port: process.env.SERVER_PORT || 8001,
    env: process.env.ENV || 'development',
    redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
    },
};

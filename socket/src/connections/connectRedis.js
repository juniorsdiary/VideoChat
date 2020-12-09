const redis = require('redis');
const { redis: { host, port } } = require('../config/vars');

Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);

let client = null;

function connectAndGetClient() {
    return new Promise((resolve, reject) => {
        const redisClient = redis.createClient({ host, port });

        redisClient.on('ready', () => {
            console.log('connected to Redis');
            resolve(redisClient);
        });
        redisClient.on('error', (err) => {
            console.log('Connection to Redis has failed');
            console.log(err.message);
            reject(err);
        });
    });
}

exports.connectRedis = () => {
    if (!client) {
        client = connectAndGetClient();
    }
    return client;
};

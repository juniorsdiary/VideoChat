const { connectRedis } = require('../../connections/connectRedis');

const setValue = async (key, value) => {
    const redisClient = await connectRedis();

    redisClient.setAsync(key, JSON.stringify(value));
};

const getValue = async (key) => {
    const redisClient = await connectRedis();

    const value = await redisClient.getAsync(key);

    return JSON.parse(value);
};

const removeValue = async (key) => {
    const redisClient = await connectRedis();

    await redisClient.delAsync(key);
}

exports.setValue = setValue;
exports.getValue = getValue;
exports.removeValue = removeValue;

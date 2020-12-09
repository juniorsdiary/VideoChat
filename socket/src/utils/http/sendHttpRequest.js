const fetch = require('isomorphic-fetch');

/**
 * Make http request
 * @param {Object} options
 * @param {Object} data
 * @param {Object} headers
 * @param {String} url
 * @param {String} options.method
 * @param {Object} [options.body] - Request body
 * @param {Object} [options.headers]
 * @returns {Promise<Object>}
 */
exports.sendHttpRequest = function sendHttpRequest({ url, data, headers = {}, ...options} = {}) {
    return fetch(url, {
        body: data ? JSON.stringify(data) : undefined,
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...headers,
        },
    });
};
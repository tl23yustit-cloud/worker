const worker1 = require('./worker1');
const worker2 = require('./worker2');
const worker3 = require('./worker3');

module.exports = {
    ...worker1,
    ...worker2,
    ...worker3
};
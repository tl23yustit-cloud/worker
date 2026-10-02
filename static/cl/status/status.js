const worker1 = require('./worker1');
const worker2 = require('./worker2');
const worker3 = require('./worker3');
const menuList = require('./menuList');
const menuListCst = require('./menuListCst');
module.exports = {
    ...worker1,
    ...worker2,
    ...worker3,
    ...menuList,
    ...menuListCst
};
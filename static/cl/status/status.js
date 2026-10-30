const worker1 = require("./worker1");
const worker2 = require("./worker2");
const worker3 = require("./worker3");
const worker4 = require("./worker4");
const worker5 = require("./worker5");
const worker6 = require("./worker6");
const menuList = require("./menuList");
const worker7 = require('./worker7');
module.exports = {
  ...worker1,
  ...worker2,
  ...worker3,
  ...worker4,
  ...worker5,
  ...worker6,
  ...menuList,
  ...worker7
};

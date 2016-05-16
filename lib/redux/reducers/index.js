'use babel'
var {combineReducers} = require('redux');

module.exports = combineReducers({
  output: require('./output'),
  compose: require('./compose')
});

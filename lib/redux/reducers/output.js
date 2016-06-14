'use babel'

var {fromJS} = require('immutable');

module.exports = function output(state = [], action) {
  switch(action.type) {
    case "LOG_RECEIVED":
      let immutableState = fromJS(state);
      let outputString = action.output;
      let splitedOutputString = outputString.split('\n');
      splitedOutputString.forEach((stringWithoutNewline) => {
        if (stringWithoutNewline != "") {
          immutableState = immutableState.push(stringWithoutNewline);
          if (state.length > 1000)
            immutableState = immutableState.shift();
        }
      });
      return immutableState.toJS();
      break;
    case "LOG_RESET":
      return [];
      break;
    default:
      return state;
  }
};

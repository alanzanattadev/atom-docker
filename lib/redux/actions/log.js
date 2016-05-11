'use babel'

let creators = {
  createLogReceivedAction: function(output) {
    return {
      type: "LOG_RECEIVED",
      output: output
    };
  },
  createLogResetAction: function() {
    return {
      type: 'LOG_RESET'
    };
  }
};

module.exports = creators;

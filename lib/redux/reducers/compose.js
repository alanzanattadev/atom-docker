'use babel'

var {fromJS} = require('immutable');

module.exports = function compose(state = {
  filePath: undefined,
  services: []
}, action) {
  switch(action.type) {
    case "COMPOSE_FILE_SELECTED":
      return fromJS(state)
              .set('filePath', action.filePath)
              .set('services', action.services.map((service) => fromJS(service).set('up', "unknown").toJS()))
              .toJS()
      break;
    case "SERVICES_REFRESHED":
      return fromJS(state)
              .set('services', action.services.map((service) => fromJS(service).set('up', "unknown").toJS()))
              .toJS();
      break;
    case "SERVICE_STATE_CHANGED":
      return fromJS(state)
              .set('services', state.services.map(service => fromJS(service).set('up', action.services.find(s => s.name == service.name).up ? "up" : "down").toJS()))
              .toJS();
      break;
    default:
      return state;
  }
};

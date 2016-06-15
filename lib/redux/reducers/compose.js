'use babel'

var {fromJS} = require('immutable');

module.exports = function compose(state = [], action) {
  let index;
  switch(action.type) {
    case "COMPOSE_FILE_SELECTED":
      return fromJS([])
              .push({
                'filePath': action.filePath,
                'services': action.services.map((service) => fromJS(service).set('up', "unknown").toJS()),
                'version': action.version,
              })
              .toJS();
      break;
    case "COMPOSE_FILE_ADDED":
      if (state.find(file => file.filePath == action.filePath))
        return state;
      else {
        return fromJS(state)
                .push({
                  'filePath': action.filePath,
                  'services': action.services.map((service) => fromJS(service).set('up', "unknown").toJS()),
                  'version': action.version,
                })
                .toJS();
      }
      break;
    case "SERVICES_REFRESHED":
      index = state.findIndex(file => file.filePath == action.filePath);
      if (index != -1) {
        return fromJS(state)
                .setIn([index, 'services'], action.services.map((service) => fromJS(service).set('up', "unknown").toJS()))
                .toJS();
      } else {
        return state;
      }
      break;
    case "SERVICE_STATE_CHANGED":
      return fromJS(state)
              .map(conf => conf.update(
                'services',
                services => services
                              .map(service => service
                                                .set('up', fromJS(action)
                                                            .get('services')
                                                            .find(s => s.get('name') == service.get('name'), {}, fromJS({}))
                                                            .get('up', 'unknown')
                                                )
                              )
                            )
              )
              .toJS();
      break;
    default:
      return state;
  }
};

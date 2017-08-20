'use babel'

var {fromJS} = require('immutable');

module.exports = function compose(state = [], action) {
  let index;
  switch(action.type) {
    case "COMPOSE_FILE_SELECTED":
      return fromJS([]).push({
        'filePath': action.filePath,
        'services': action.services.map((service) => fromJS(service).set('up', "unknown").toJS()),
        'version': action.version,
      }).toJS();
    case "COMPOSE_FILE_ADDED":
      if (state.find(file => file.filePath == action.filePath))
        return state;
      else {
        return fromJS(state).push({
          'filePath': action.filePath,
          'services': action.services.map((service) => fromJS(service).set('up', "unknown").toJS()),
          'version': action.version,
        }).toJS();
      }
    case "SERVICES_REFRESHED":
      index = state.findIndex(file => file.filePath == action.filePath);
      if (index != -1) {
        return fromJS(state)
                .setIn([index, 'services'], action.services.map((service) => fromJS(service).set('up', "unknown").toJS()))
                .toJS();
      } else {
        return state;
      }
    case "SERVICE_STATE_CHANGED":
      return fromJS(state).map(conf => conf.update('services', services => {
        return services.map(service => {
          let new_service = fromJS(action).get('services').find(s => {
            let n = s.get('name');
            return n == service.get('name') || n == service.get('container_name');
          }, {}, fromJS({}));

          return service.set('up', new_service.get('up', 'unknown'));
        });
      })).toJS();
    default:
      return state;
  }
};

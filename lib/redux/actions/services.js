'use babel'

var creators = {
   createComposeFileSelectedAction: function(filePath, services, version) {
     return {
       type: "COMPOSE_FILE_SELECTED",
       filePath,
       services,
       version
     };
   },
   createServicesRefreshedAction: function(services) {
     return {
       type: "SERVICES_REFRESHED",
       services: services
     };
   },
   createServiceStateChangedAction: function(services) {
     return {
       type: "SERVICE_STATE_CHANGED",
       services: services
     };
   }
};

module.exports = creators;

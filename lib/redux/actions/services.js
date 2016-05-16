'use babel'

var creators = {
   createComposeFileSelectedAction: function(filePath, services) {
     return {
       type: "COMPOSE_FILE_SELECTED",
       filePath,
       services
     };
   },
   createServicesRefreshedAction: function(services) {
     return {
       type: "SERVICES_REFRESHED",
       services: services
     };
   }
};

module.exports = creators;

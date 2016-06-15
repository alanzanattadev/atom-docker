'use babel'
// @flow weak

jest.unmock('immutable');

describe('Reducers', () => {
  describe('Compose', () => {
    jest.unmock('../lib/redux/reducers/compose');
    let reducer = require('../lib/redux/reducers/compose');

    it('should select compose file', () => {
      let result = reducer([], {
        type: "COMPOSE_FILE_SELECTED",
        filePath: "./docker-compose.yml",
        version: '2',
        services: [{
          name: "web"
        }, {
          name: "database"
        }]
      });
      expect(result.length).toBe(1);
      expect(result[0].filePath).toBe('./docker-compose.yml');
      expect(result[0].version).toBe('2');
      expect(result[0].services.length).toBe(2);
      expect(result[0].services[0].up).toBe('unknown');
    });

    it('should add compose file', () => {
      let result = reducer([{
        filePath: "./docker-compose.elk.yml",
        version: '2',
        services: [{
          name: "elasticsearch"
        }, {
          name: "kibana"
        }]
      }], {
        type: "COMPOSE_FILE_ADDED",
        version: '2',
        filePath: "./docker-compose.yml",
        services: [{
          name: "web"
        }, {
          name: "database"
        }]
      });

      expect(result.length).toBe(2);
      expect(result[1].filePath).toBe('./docker-compose.yml');
      expect(result[1].services[0].name).toBe("web");
    });

    it('should override config when compose file is selected', () => {
      let result = reducer([{
        version: '2',
        filePath: "./docker-compose.elk.yml",
        services: [{
          name: "elasticsearch"
        }, {
          name: "kibana"
        }]
      }, {
        version: '2',
        filePath: "./docker-compose.web.yml",
        services: [{
          name: "web"
        }, {
          name: "database"
        }]
      }], {
        type: "COMPOSE_FILE_SELECTED",
        filePath: "./docker-compose.yml",
        version: '2',
        services: [{
          name: "web"
        }, {
          name: "database"
        }]
      });

      expect(result.length).toBe(1);
      expect(result[0].filePath).toBe('./docker-compose.yml');
    });

    it('should refresh services of compose file', () => {
      let result = reducer([{
        version: '2',
        filePath: "./docker-compose.elk.yml",
        services: [{
          name: "elasticsearch"
        }, {
          name: "kibana"
        }]
      }, {
        version: '2',
        filePath: "./docker-compose.web.yml",
        services: [{
          name: "web"
        }, {
          name: "database"
        }]
      }], {
        type: "SERVICES_REFRESHED",
        filePath: "./docker-compose.web.yml",
        services: [{
          name: "web"
        }, {
          name: "database"
        }, {
          name: "proxy"
        }]
      });

      expect(result[1].services.length).toBe(3);
    });

    it('should change state of service', () => {
      let result = reducer([{
        version: '2',
        filePath: "./docker-compose.elk.yml",
        services: [{
          name: "elasticsearch"
        }, {
          name: "kibana"
        }]
      }, {
        version: '2',
        filePath: "./docker-compose.web.yml",
        services: [{
          name: "web"
        }, {
          name: "database"
        }, {
          name: "proxy"
        }]
      }], {
        type: "SERVICE_STATE_CHANGED",
        services: [{
          name: "elasticsearch",
          up: "up"
        }, {
          name: "web",
          up: "down"
        }, {
          name: "proxy",
          up: "up"
        }]
      });

      expect(result[0].services.length).toBe(2);
      expect(result[0].services[0].up).toBe('up');
      expect(result[1].services.length).toBe(3);
      expect(result[1].services[0].up).toBe('down');
      expect(result[1].services[1].up).toBe('unknown');
      expect(result[1].services[2].up).toBe('up');
    });
  })
});

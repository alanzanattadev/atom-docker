'use babel';

import { CompositeDisposable } from 'atom';
import yaml from 'js-yaml';
import {React, ReactDOM} from 'react-for-atom';
import ComposePanel from './components/ComposePanel';
import {exec, spawn} from 'child_process';
import path from 'path';
import store from './redux/store';
import {createLogReceivedAction} from './redux/actions/log';
import {createComposeFileSelectedAction, createServiceStateChangedAction} from './redux/actions/services';

export default {

  dockerView: null,
  bottomPanel: null,
  subscriptions: null,

  compose: {
    filePath: undefined,
    config: undefined,
  },

  activate(state) {
    this.dockerView = document.createElement('div');
    this.dockerView.classList.add("docker");
    this.bottomPanel = atom.workspace.addBottomPanel({
      item: this.dockerView,
      visible: false
    });

    ReactDOM.render(<div>Select a compose file with docker:select-compose-file</div>, this.dockerView);
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'docker:toggle': () => this.toggle(),
      'docker:select-compose-file': () => this.selectComposeFile().then(function() {

      }),
    }));
  },

  deactivate() {
    this.bottomPanel.destroy();
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },

  selectComposeFile() {
    return new Promise((resolve, reject) => {
      let grammarName = atom.workspace.getActiveTextEditor().getGrammar().name;
      if (grammarName != "YAML") {
        atom.notifications.addWarning("Selected file is not a docker-compose file");
      } else {
        let composeFile = atom.workspace.getActivePaneItem().buffer.file;
        let composeFilePath = composeFile.getPath();
        console.log(`selected compose file : ${composeFilePath}`);
        composeFile.read().then((content) => {
          try {
            var yamlContent = yaml.safeLoad(content);
            console.log(yamlContent);
            let services;
            let version = yamlContent.version;
            if (version == '2') {
              services = Object.keys(yamlContent.services).map((key) => {return {
                name: key,
                tag: yamlContent.services[key].image && yamlContent.services[key].build ? yamlContent.services[key].image : undefined
              }});
            } else {
              services = Object.keys(yamlContent).map((key) => {return {name: key}});
            }
            store.dispatch(createComposeFileSelectedAction(composeFilePath, services, version));
            this.renderServiceList();
            this.execComposeCommand('ps', [], true)
              .then((stdout) => this.handlePSOutput(stdout))
              .catch(() => {});
            if (this.bottomPanel.isVisible() == false)
              this.bottomPanel.show();
            resolve();
          } catch (e) {
            console.log(e);
            atom.notifications.addError("Impossible to select compose file", {
              detail: e.toString()
            });
            resolve(e);
          }
        });
      }
    });
  },
  getCommandArgs: function(filePath, action, serviceNames) {
    return [
      '-f', filePath,
      action,
      action == "up" ? "-d" : "",
      action == "rm" ? "-f" : "",
      ...serviceNames
    ].filter((arg) => arg != "");
  },
  execComposeCommand: function(action, serviceNames, withExec) {
    withExec = withExec || false;
    serviceNames = serviceNames || [];
    let filePath = store.getState().compose.filePath;
    return new Promise((resolve, reject) => {
      if (withExec) {
        exec('docker-compose '.concat(this.getCommandArgs(filePath, action, serviceNames).join(' ')), {
          cwd: path.dirname(filePath)
        }, function(error, stdout, stderr) {
          if (error)
            reject(stderr);
          else
            resolve(stdout);
        });
      } else {
        var child = spawn(
          'docker-compose', this.getCommandArgs(filePath, action, serviceNames),
          {cwd: path.dirname(filePath)}
        );
        let dataHandler = (data) => store.dispatch(createLogReceivedAction(data.toString()));
        child.stdout.on('data', dataHandler);
        child.stderr.on('data', dataHandler);
        child.on('exit', (code) => {
          if (code == 0)
          resolve();
          else
          reject();
        });
      }
    });
  },
  handlePSOutput: function(output) {
    let lines = output.split('\n').slice(2);
    let services = store.getState().compose.services;
    let refreshedServices = services.map(
      service => {
        return {
          name: service.name,
          up: lines
                .filter(line => line.split(' ')[0].indexOf(service.name) != -1)
                [0]
                .indexOf(' Up ') != -1
        };
      }
    );
    store.dispatch(createServiceStateChangedAction(refreshedServices));
    this.renderServiceList();
    console.log(refreshedServices);
  },
  onComposeAction: function(action, serviceNames) {
    store.dispatch(createLogReceivedAction(`[Atom] ${action}...`));
    if (action == "push") {
      atom.notifications.addSuccess("Push ".concat(store.getState().compose.services.find(service => service.name == serviceNames[0]).tag));
    } else {
      this.execComposeCommand(action, serviceNames, action == "ps")
      .then((stdout) => {
        atom.notifications.addSuccess(`${action} ${serviceNames && serviceNames.length > 0 ? serviceNames.join(' ') : ""}`, {});
        if (action == "ps") {
          this.handlePSOutput(stdout);
        }
        if (action == "up" || action == "restart") {
          this.composePanel.composeLogs.serviceLaunched();
        }
      })
      .catch((stderr) => {
        atom.notifications.addError(`${action} ${serviceNames && serviceNames.length > 0 ? serviceNames.join(' ') : ""}`, {
          dismissable: false,
          detail: stderr
        });
      });
    }
  },
  renderServiceList: function() {
    this.composePanel = ReactDOM.render(
      <ComposePanel
        services={store.getState().compose.services}
        onAction={this.onComposeAction.bind(this)}
        composeFilePath={store.getState().compose.filePath}
      />,
      this.dockerView
    );
  },
  toggle() {
    return (
      this.bottomPanel.isVisible() ?
      this.bottomPanel.hide() :
      this.bottomPanel.show()
    );
  }

};

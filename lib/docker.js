'use babel'
// @flow weak


import { CompositeDisposable } from 'atom';
import yaml from 'js-yaml';
import {React, ReactDOM} from 'react-for-atom';
import ComposePanel from './components/ComposePanel';
import {exec, spawn} from 'child_process';
import path from 'path';
import store from './redux/store';
import {createLogReceivedAction} from './redux/actions/log';
import {createComposeFileSelectedAction, createComposeFileAddedAction, createServiceStateChangedAction} from './redux/actions/services';
import RemoteInfosPrompt from './components/RemoteInfosPrompt';
import {fromJS} from 'immutable';

export default {

  dockerView: null,
  bottomPanel: null,
  subscriptions: null,
  config: {
    supressNotifications: {
      title: 'Supress notifications',
      description: 'This supresses "verbose" notifications when commands are successfully executed',
      type: 'boolean',
      default: false
    }
  },

  activate(state) {
    this.dockerView = document.createElement('div');
    this.dockerView.classList.add("docker");
    this.bottomPanel = atom.workspace.addBottomPanel({
      item: this.dockerView,
      visible: false
    });
    this.modalView = document.createElement('div');
    this.modalView.classList.add("docker");
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.modalView,
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
      'docker:add-compose-file': () => this.selectComposeFile(true).then(function() {

      }),
    }));
  },

  deactivate() {
    this.bottomPanel.destroy();
    this.modalPanel.destroy();
    this.subscriptions.dispose();
  },

  serialize() {
    return {
    };
  },
  pushSuccessVerboseNotification(...args) {
    if(atom.config.get('docker.supressNotifications')) {
      return;
    }
    atom.notifications.addSuccess(...args);
  },
  selectComposeFile(adding) {
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
            store.dispatch(
              adding
              ?
                createComposeFileAddedAction(composeFilePath, services, version)
              :
                createComposeFileSelectedAction(composeFilePath, services, version)
            );
            this.renderServiceList();
            this.execPS();
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
  getCommandArgs: function(filePaths, action, serviceNames) {
    return [
      ...fromJS(filePaths).map(filePath => ['-f', filePath]).reduce((reduction, value) => reduction.concat(value), fromJS([])).toJS(),
      action,
      action == "up" ? "-d" : "",
      action == "rm" ? "-f" : "",
      ...serviceNames
    ].filter((arg) => arg != "");
  },
  execComposeCommand: function(action, serviceNames, withExec) {
    withExec = withExec || false;
    serviceNames = serviceNames || [];
    let filePaths = store.getState().compose.map(conf => conf.filePath);
    return new Promise((resolve, reject) => {
      if (withExec) {
        exec('docker-compose '.concat(this.getCommandArgs(filePaths, action, serviceNames).join(' ')), {
          cwd: path.dirname(filePaths[0])
        }, function(error, stdout, stderr) {
          if (error)
            reject(stderr);
          else
            resolve(stdout);
        });
      } else {
        var child = spawn(
          'docker-compose', this.getCommandArgs(filePaths, action, serviceNames),
          {cwd: path.dirname(filePaths[0])}
        );
        let dataHandler = (data) => {
          let str = data.toString();
          store.dispatch(createLogReceivedAction(str));
          if (str.indexOf('exited with code') != -1)
            this.execPS();
        };
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
  execPS: function() {
    this.execComposeCommand('ps', [], true)
      .then((stdout) => this.handlePSOutput(stdout))
      .catch(() => {});
  },
  handlePSOutput: function(output) {
    let lines = output.split('\n').slice(2);
    let services = fromJS(store.getState().compose)
                    .map(config => config.get('services'))
                    .reduce((reduction, value) => reduction.concat(value), fromJS([]))
                    .toJS();
    let refreshedServices = services.map(
      service => {
        let line =
          lines
            .find(line => {
              let splittedLine = line.split(' ');
              if (splittedLine.length > 0) {
                return splittedLine[0].indexOf(service.name) != -1;
              } else {
                return false;
              }
            });
        return {
          name: service.name,
          up: line ? (line.indexOf(' Up ') != -1 ? 'up' : 'down') : 'down'
        };
      }
    );
    console.log(refreshedServices);
    store.dispatch(createServiceStateChangedAction(refreshedServices));
    this.renderServiceList();
  },
  pushImage: function(tag, remoteTag) {
    exec(`docker tag ${tag} ${remoteTag}`, {}, (err, stdout, stderr) => {
      if (err) {
        atom.notifications.addError(`Impossible to tag ${tag} with ${remoteTag}`, {dismissable: true, detail: stderr});
        return;
      } else {
        atom.notifications.addSuccess(`Tagged ${tag} with ${remoteTag} successfully, pushing ...`);
        exec(`docker push ${remoteTag}`, {}, (error, pushStdout, pushStderr) => {
          if (error) {
            atom.notifications.addError(`Impossible to push ${remoteTag}`, {dismissable: true, detail: pushStderr});
          } else {
            atom.notifications.addSuccess(`Pushed ${remoteTag} successfully`);
          }
        });
      }
    });
  },
  onPush: function(serviceNames) {
    let tag = fromJS(store.getState().compose)
              .map(conf => conf.services)
              .reduce((reduction, value) => reduction.concat(value), fromJS([]))
              .find(service => service.get('name') == serviceNames[0])
              .get('tag');
    let prompt = ReactDOM.render(<RemoteInfosPrompt />, this.modalView);
    this.modalView.onkeydown = (e) => {
      var ctrlDown = e.ctrlKey || e.metaKey;
      if (e.which == 27) { // esc
        this.modalPanel.hide();
      } else if (e.which == 13) { //enter
        if (prompt.text.value.length > 0) {
          this.modalPanel.hide();
          let newTag = prompt.text.value;
          atom.notifications.addSuccess(`${tag} => ${newTag}`);
          this.pushImage(tag, newTag);
        }
      }
    };
    this.modalPanel.show()
    prompt.text.focus();
  },
  onComposeAction: function(action, serviceNames) {
    store.dispatch(createLogReceivedAction(`[Atom] ${action}...`));
    if (action == "push") {
      this.onPush(serviceNames);
    } else {
      this.execComposeCommand(action, serviceNames, action == "ps")
      .then((stdout) => {
        this.pushSuccessVerboseNotification(`${action} ${serviceNames && serviceNames.length > 0 ? serviceNames.join(' ') : ""}`, {});
        if (action == "ps") {
          this.handlePSOutput(stdout);
        }
        if (action == "up" || action == "restart") {
          this.composePanel.composeLogs.serviceLaunched();
        }
        if (action == "up" || action == "restart" || action == "stop") {
          this.execPS();
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
        onAction={this.onComposeAction.bind(this)}
        composeFilePaths={store.getState().compose.map(conf => conf.filePath)}
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

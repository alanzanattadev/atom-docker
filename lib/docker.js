'use babel';

import { CompositeDisposable } from 'atom';
import yaml from 'js-yaml';
import {React, ReactDOM} from 'react-for-atom';
import ComposePanel from './components/ComposePanel';
import {exec} from 'child_process';
import path from 'path';

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
        this.compose.filePath = composeFilePath;
        composeFile.read().then((content) => {
          try {
            var yamlContent = yaml.safeLoad(content);
            console.log(yamlContent);
            this.compose.config = yamlContent;
            this.renderServiceList();
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
  execComposeCommand: function(action, serviceNames) {
    return new Promise((resolve, reject) => {
      exec(
        `docker-compose -f ${this.compose.filePath} ${action} ${action == "up" ? "-d" : ""} ${action == "rm" ? "-f" : ""} ${serviceNames ? serviceNames.join(' ') : ""}`,
        {cwd: path.dirname(this.compose.filePath)},
        (err, stdout, stderr) => {
          if (err)
            reject(stderr);
          else
            resolve(stdout);
        }
      );
    });
  },
  onComposeAction: function(action, serviceNames) {
    this.execComposeCommand(action, serviceNames)
      .then((stdout) => {
        atom.notifications.addSuccess(`${action} ${serviceNames && serviceNames.length > 0 ? serviceNames.join(' ') : ""}`, {
          detail: stdout
        });
        this.composePanel.composeLogs.logPanel.handleOutput(action);
        if (action == "up" || action == "restart") {
          this.composePanel.composeLogs.serviceLaunched();
        }
      })
      .catch((stderr) => {
        atom.notifications.addError(`${action} ${serviceNames.length > 0 ? serviceNames.join(' ') : ""}`, {
          dismissable: false,
          detail: stderr
        });
        this.composePanel.composeLogs.logPanel.handleOutput(action);
      });
  },
  renderServiceList: function() {
    let services;
    if (this.compose.config.version == '2') {
      services = Object.keys(this.compose.config.services).map((key) => {return {name: key}});
    } else {
      services = Object.keys(this.compose.config).map((key) => {return {name: key}});
    }
    console.log(`services : ${JSON.stringify(services)}`);
    this.composePanel = ReactDOM.render(
      <ComposePanel
        services={services}
        onAction={this.onComposeAction.bind(this)}
        composeFilePath={this.compose.filePath}
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

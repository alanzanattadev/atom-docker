'use babel';

import {React} from 'react-for-atom';
import child_process from 'child_process';
import ServiceLogs from './ServiceLogs';

export default React.createClass({
  getInitialState: function() {
    return {
      commandRunning: false
    };
  },
  getDefaultProps: function() {
    return {
      composeFilePath: ""
    };
  },
  componentDidMount: function() {
    this.exec();
  },
  componentDidUnmount: function() {
    this.kill();
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.composeFilePath != this.props.composeFilePath) {
      this.logPanel.reload();
    }
  },
  exec: function() {
    if (this.props.composeFilePath == "")
      return;
    this.command = child_process.spawn('docker-compose', ['-f', this.props.composeFilePath, 'logs', '-f', '--tail', '40']);
    this.command.stdout.on('data', (output) => {this.logPanel.handleOutput(output);});
    this.command.stderr.on('data', (output) => {this.logPanel.handleOutput(output);});
    this.setState({commandRunning: true});
    this.command.on('exit', () => {
      this.setState({commandRunning: false});
    });
  },
  serviceLaunched: function() {
    if (this.state.commandRunning == false)
      this.exec();
  },
  kill: function() {
    this.command.kill();
  },
  reload: function() {
    this.kill();
    this.exec();
  },
  render: function() {
    return (<ServiceLogs {...this.props} ref={(logPanel) => this.logPanel = logPanel} attached={this.state.commandRunning} reload={this.reload} stop={this.kill}/>)
  }
});

'use babel';

import {React, update} from 'react-for-atom';
import child_process from 'child_process';
import ServiceLogs from './ServiceLogs';
import store from '../redux/store';
import {createLogReceivedAction, createLogResetAction} from '../redux/actions/log';
import _ from 'lodash';

export default React.createClass({
  getInitialState: function() {
    return {
      commandRunning: false,
      output: store.getState().output
    };
  },
  getDefaultProps: function() {
    return {
      composeFilePath: ""
    };
  },
  componentDidMount: function() {
    this.unsubscribe = store.subscribe(this.onCacheChanged);
    this.trotthledUpdate = _.throttle(() => {this.forceUpdate()}, 200);
    this.exec();
  },
  componentDidUnmount: function() {
    this.kill();
    this.unsubscribe();
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.composeFilePath != this.props.composeFilePath) {
      this.reload();
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return (
      this.props.filters != nextProps.filters ||
      this.props.composeFilePath != nextProps.composeFilePath ||
      this.state.commandRunning != nextState.commandRunning
    );
  },
  onCacheChanged: function() {
    if (store.getState().output != this.state.output){
      this.setState(update(this.state, {
        output: {$set: store.getState().output}
      }), this.trotthledUpdate);
    }
  },
  exec: function() {
    if (this.props.composeFilePath == "" || this.state.commandRunning == true)
      return;
    this.command = child_process.spawn('docker-compose', ['-f', this.props.composeFilePath, 'logs', '-f', '--tail', '40']);
    this.command.stdout.on('data', (output) => this.dispatchNewOutput(output.toString()));
    this.command.stderr.on('data', (output) => this.dispatchNewOutput(output.toString()));
    this.setState(update(this.state, {
      commandRunning: {$set: true}
    }));
    this.command.on('exit', () => {
      this.setState(update(this.state, {
        commandRunning: {$set: false}
      }));
    });
  },
  dispatchNewOutput: function(output) {
    store.dispatch(createLogReceivedAction(output));
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
    store.dispatch(createLogResetAction());
    this.exec();
  },
  render: function() {
    return (<ServiceLogs {...this.props} output={this.state.output} attached={this.state.commandRunning} reload={this.reload} stop={this.kill}/>)
  }
});

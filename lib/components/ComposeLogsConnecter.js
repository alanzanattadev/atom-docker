'use babel';

import {React, update} from 'react-for-atom';
import child_process from 'child_process';
import ServiceLogs from './ServiceLogs';
import store from '../redux/store';
import {createLogReceivedAction, createLogResetAction} from '../redux/actions/log';
import _ from 'lodash';
import docker from '../docker';
import {fromJS} from 'immutable';

export default React.createClass({
  getInitialState: function() {
    return {
      commandRunning: false,
      output: store.getState().output
    };
  },
  getDefaultProps: function() {
    return {
      composeFilePaths: []
    };
  },
  componentDidMount: function() {
    this.unsubscribe = store.subscribe(this.onCacheChanged);
    this.trotthledUpdate = _.throttle(() => {this.forceUpdate()}, 200);
    this.exec();
  },
  componentWillUnmount: function() {
    this.kill();
    this.unsubscribe();
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.composeFilePaths.join(' ') != this.props.composeFilePaths.join(' ')) {
      this.reload();
    }
  },
  shouldComponentUpdate: function(nextProps, nextState) {
    return (
      this.props.filters != nextProps.filters ||
      this.props.composeFilePaths != nextProps.composeFilePaths ||
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
    if (this.props.composeFilePaths.join(' ') == "" || this.state.commandRunning == true)
      return;
    this.command = child_process.spawn('docker-compose', [...fromJS(this.props.composeFilePaths)
                                                              .map(p => fromJS(["-f", p]))
                                                              .reduce((reduction, v) => v.concat(reduction), fromJS([]))
                                                              .toJS(),
                                                          'logs', '-f', '--tail', '40']);
    let dataHandler = (output) => {
      let str = output.toString();
      this.dispatchNewOutput(str);
      if (str.indexOf('exited with code') != -1) {
        docker.execPS();
      }
    }
    this.command.stdout.on('data', dataHandler);
    this.command.stderr.on('data', dataHandler);
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
    this.command && this.command.kill();
  },
  reload: function() {
    this.kill();
    this.clear();
    this.exec();
  },
  clear: function() {
    store.dispatch(createLogResetAction());
  },
  render: function() {
    return (<ServiceLogs {...this.props} output={this.state.output} attached={this.state.commandRunning} reload={this.reload} stop={this.kill} clear={this.clear}/>)
  }
});

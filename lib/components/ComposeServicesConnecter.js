'use babel'
// @flow weak

import {React} from 'react-for-atom';
import {fromJS} from 'immutable';

import store from '../redux/store';

export default React.createClass({
  getInitialState: function() {
    return this.getUpdatedState();
  },
  getDefaultProps: function() {
    return {};
  },
  componentDidMount: function() {
    this.unsubscribe = store.subscribe(this.updateState);
  },
  componentWillUnmount: function() {
    this.unsubscribe();
  },
  getUpdatedState: function() {
    return {
      services: fromJS(store.getState().compose)
                  .map(config => config.get('services'), fromJS([]))
                  .reduce((reduction, value) => reduction.concat(value), fromJS([]))
                  .toJS()
    };
  },
  updateState: function() {
    this.setState(this.getUpdatedState());
  },
  render: function() {
    return (
      React.cloneElement(this.props.children, {
        services: this.state.services,
      })
    );
  }
});

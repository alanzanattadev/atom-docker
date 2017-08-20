'use babel'

import {React} from 'react-for-atom';
import ServiceControls from './ServiceControls';

export default React.createClass({
  getDefaultProps: function() {
    return {
      name: "error",
      up: "unknown",
      onFilterChange: function() {

      },
      onAction: function(action, serviceName) {

      }
    };
  },
  render: function() {
    return (
      <ServiceControls
        up={this.props.up}
        name={this.props.container_name || this.props.name}
        onFilterChange={this.props.onFilterChange}
        selected={this.props.selected}
        onUpClick={() => this.props.onAction("up", this.props.name)}
        onBuildClick={() => this.props.onAction("build", this.props.name)}
        onRestartClick={() => this.props.onAction("restart", this.props.name)}
        onStopClick={() => this.props.onAction("stop", this.props.name)}
        onRmClick={() => this.props.onAction("rm", this.props.name)}
        onPushClick={this.props.tag ? () => this.props.onAction('push', this.props.name) : undefined}
      />
    );
  }
});

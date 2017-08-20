'use babel'

import {React} from 'react-for-atom';
import ServiceItem from './ServiceItem';
import ServiceControls from './ServiceControls';
import {fromJS} from 'immutable';

export default React.createClass({
  getInitialState: function() {
    return {
      filters: []
    };
  },
  getDefaultProps: function() {
    return {
      services: [],
      onFiltersChange: function() {

      },
      onAction: function(action, serviceNames) {

      }
    };
  },
  onFilterChange: function(serviceName) {
    return (selected) => {
      let newFilters;
      if (serviceName != "all") {
        if (selected) {
          newFilters = fromJS(this.state.filters).push(serviceName).toJS();
        } else {
          newFilters = this.state.filters.filter(service => service != serviceName);
        }
      } else {
        if (selected) {
          newFilters = this.props.services.map(service => {
            return service.container_name || service.name;
          });
        } else {
          newFilters = [];
        }
      }
      this.setState({filters: newFilters}, () => {this.props.onFiltersChange(newFilters)});
    };
  },
  render: function() {
    return (
      <table className="services">
        <thead>
          <tr>
            <td>Container</td>
            <td>Push</td>
            <td>Refresh</td>
            <td>Start</td>
            <td>Build</td>
            <td>Restart</td>
            <td>Stop</td>
            <td>Remove</td>
            <td>Show output</td>
          </tr>
          <ServiceControls
            applyToAll={true}
            onFilterChange={this.onFilterChange("all")}
            selected={this.state.filters.length == this.props.services.length}
            onUpClick={() => this.props.onAction("up")}
            onBuildClick={() => this.props.onAction("build")}
            onRestartClick={() => this.props.onAction("restart")}
            onStopClick={() => this.props.onAction("stop")}
            onRmClick={() => this.props.onAction("rm")}
            onPSClick={() => this.props.onAction('ps')}
          />
        </thead>
        <tbody>
          {this.props.services.map((service, i) => (
            <ServiceItem
              key={`service${i}`}
              onFilterChange={this.onFilterChange(service.name)}
              selected={this.state.filters.find(filter => filter == (service.container_name || service.name)) !== undefined}
              onAction={(action, serviceName) => this.props.onAction(action, [serviceName])}
              {...service}
            />
          ))}
        </tbody>
      </table>
    );
  }
})

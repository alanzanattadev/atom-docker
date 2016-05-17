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
          newFilters = this.props.services.map(service => service.name);
        } else {
          newFilters = [];
        }
      }
      this.setState({filters: newFilters}, () => {this.props.onFiltersChange(newFilters)});
    };
  },
  render: function() {
    return (
      <div style={{padding: "15px", display: "flex", flexDirection: "column", alignSelf: "stretch", alignItems: "stretch", flex: "1"}}>
        <div style={{display: "flex", flexDirection: "row", justifyContent: "flex-end", marginRight: "10px"}}>
          <ServiceControls
            onFilterChange={this.onFilterChange("all")}
            selected={this.state.filters.length == this.props.services.length}
            onUpClick={() => this.props.onAction("up")}
            onBuildClick={() => this.props.onAction("build")}
            onRestartClick={() => this.props.onAction("restart")}
            onStopClick={() => this.props.onAction("stop")}
            onRmClick={() => this.props.onAction("rm")}
            onPSClick={() => this.props.onAction('ps')}
          />
        </div>
        <div style={{marginTop: "10px", marginBottom: "10px", display: "flex", flexDirection: "column", overflowY: "scroll", flex: "1"}}>
          <div style={{}}>
            {this.props.services.map((service, i) => (
              <ServiceItem
                key={`service${i}`}
                onFilterChange={this.onFilterChange(service.name)}
                selected={this.state.filters.find(filter => filter == service.name) !== undefined}
                onAction={(action, serviceName) => this.props.onAction(action, [serviceName])}
                {...service}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
})

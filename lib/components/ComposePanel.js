'use babel'

import {React} from 'react-for-atom';
import ServiceList from './ServiceList';
import ComposeLogsConnecter from './ComposeLogsConnecter';

export default React.createClass({
  getInitialState: function() {
    return {
      filters: []
    };
  },
  getDefaultProps: function() {
    return {
      services: [],
      composeFilePath: "",
      onAction: function(action, serviceNames) {

      }
    };
  },
  render: function() {
    return (
      <div className="compose-panel">
        <ServiceList services={this.props.services} onFiltersChange={(newFilters) => this.setState({filters: newFilters})} onAction={this.props.onAction}/>
        <ComposeLogsConnecter filters={this.state.filters} composeFilePath={this.props.composeFilePath} ref={(logConnecter) => this.composeLogs = logConnecter}/>
      </div>
    );
  }
});

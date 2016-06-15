'use babel'

import {React} from 'react-for-atom';
import ServiceList from './ServiceList';
import ComposeLogsConnecter from './ComposeLogsConnecter';
import ComposeServicesConnecter from './ComposeServicesConnecter';

export default React.createClass({
  getInitialState: function() {
    return {
      filters: []
    };
  },
  getDefaultProps: function() {
    return {
      composeFilePaths: [],
      onAction: function(action, serviceNames) {

      }
    };
  },
  render: function() {
    return (
      <div className="compose-panel">
        <ComposeServicesConnecter>
          <ServiceList onFiltersChange={(newFilters) => this.setState({filters: newFilters})} onAction={this.props.onAction}/>
        </ComposeServicesConnecter>
        <ComposeLogsConnecter filters={this.state.filters} composeFilePaths={this.props.composeFilePaths} ref={(connecter) => this.composeLogs = connecter}/>
      </div>
    );
  }
});

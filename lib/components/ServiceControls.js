'use babel'

import {React} from 'react-for-atom';

export default React.createClass({
  getDefaultProps: function() {
    return {
      onFilterChange: function() {

      },
      onUpClick: function() {

      },
      onBuildClick: function() {

      },
      onRestartClick: function() {

      },
      onStopClick: function() {

      },
      onRmClick: function() {

      },
    }
  },
  render: function() {
    return (
      <div style={{display: "flex", flexDirection: "row", marginLeft: "10px", marginRight: "15px"}}>
        {
          this.props.onPushClick ?
            (<button className="compose-control icon icon-docker-push" type="button" onClick={this.props.onPushClick}></button>)
          :
          undefined
        }
        {
          this.props.onPSClick ?
            (<button className="compose-control icon icon-docker-ps" type="button" onClick={this.props.onPSClick}></button>)
          :
          undefined
        }
        <button className="compose-control icon icon-docker-up" type="button" onClick={this.props.onUpClick}></button>
        <button className="compose-control icon icon-docker-build" type="button" onClick={this.props.onBuildClick}></button>
        <button className="compose-control icon icon-docker-restart" type="button" onClick={this.props.onRestartClick}></button>
        <button className="compose-control icon icon-docker-stop" type="button" onClick={this.props.onStopClick}></button>
        <button className="compose-control icon icon-docker-rm" type="button" onClick={this.props.onRmClick}></button>
        <input type="checkbox" className="compose-control" checked={this.props.selected} onChange={(event) => {this.props.onFilterChange(event.target.checked)}}/>
      </div>
    );
  }
});

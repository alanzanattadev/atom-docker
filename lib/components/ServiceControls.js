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
        <button className="compose-control" type="button" onClick={this.props.onUpClick}>up</button>
        <button className="compose-control" type="button" onClick={this.props.onBuildClick}>build</button>
        <button className="compose-control" type="button" onClick={this.props.onRestartClick}>restart</button>
        <button className="compose-control" type="button" onClick={this.props.onStopClick}>stop</button>
        <button className="compose-control" type="button" onClick={this.props.onRmClick}>rm</button>
        <input type="checkbox" className="compose-control" checked={this.props.selected} onChange={(event) => {this.props.onFilterChange(event.target.checked)}}/>
      </div>
    );
  }
});

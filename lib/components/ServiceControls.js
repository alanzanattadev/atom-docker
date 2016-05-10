'use babel'

import {React} from 'react-for-atom';

export default React.createClass({
  getDefaultProps: function() {
    return {
      onFilterChange: function() {

      },
      onUpClick: function() {

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
        <button className="compose-control" type="button" onClick={this.props.onUpClick}>Up</button>
        <button className="compose-control" type="button" onClick={this.props.onRestartClick}>Restart</button>
        <button className="compose-control" type="button" onClick={this.props.onStopClick}>Stop</button>
        <button className="compose-control" type="button" onClick={this.props.onRmClick}>Rm</button>
        <input type="checkbox" className="compose-control" checked={this.props.selected} onChange={(event) => {this.props.onFilterChange(event.target.checked)}}/>
      </div>
    );
  }
});

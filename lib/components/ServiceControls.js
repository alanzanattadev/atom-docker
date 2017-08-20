'use babel'

import {React} from 'react-for-atom';
import classNames from 'classnames';

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
      <tr className="service-item">
        <td className={classNames("service-name", {
          "up": this.props.up == "up",
          "down": this.props.up == "down"
        })}>
          {this.props.name}
        </td>
        <td>
        {
          this.props.onPushClick ?
            (
              <button className="compose-control icon icon-docker-push" type="button" onClick={this.props.onPushClick}></button>
            )
          :
            undefined
        }
        </td>
        <td>
        {
          this.props.onPSClick ?
            (
              <button className="compose-control icon icon-docker-ps" type="button" onClick={this.props.onPSClick}></button>
            )
          :
            undefined
        }
        </td>
        <td>
        {
          (this.props.up != "up" || this.props.applyToAll) ?
            (
              <button className="compose-control icon icon-docker-up" type="button" onClick={this.props.onUpClick}></button>
            )
          :
            undefined
        }
        </td>
        <td>
          <button className="compose-control icon icon-docker-build" type="button" onClick={this.props.onBuildClick}></button>
        </td>
        <td>
          <button className="compose-control icon icon-docker-restart" type="button" onClick={this.props.onRestartClick}></button>
        </td>
        <td>
        {
          (this.props.up == "up" || this.props.applyToAll) ?
            (
              <button className="compose-control icon icon-docker-stop" type="button" onClick={this.props.onStopClick}></button>
            )
          :
            undefined
        }
        </td>
        <td>
          <button className="compose-control icon icon-docker-rm" type="button" onClick={this.props.onRmClick}></button>
        </td>
        <td>
          <input type="checkbox" className="compose-control" checked={this.props.selected} onChange={(event) => {this.props.onFilterChange(event.target.checked)}}/>
        </td>
      </tr>
    );
  }
});

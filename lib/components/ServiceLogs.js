'use babel'

import {React} from 'react-for-atom';
import Convert from 'ansi-to-html';
import child_process from 'child_process';
import {fromJS} from 'immutable';
import _ from 'lodash';

export default React.createClass({
  getInitialState: function() {
    return {
      cachedOutput: []
    };
  },
  getDefaultProps: function() {
    return {
      filters: [],
      reload: function() {

      },
      stop: function() {

      }
    };
  },
  componentDidMount: function() {
    this.updateInnerHtml = _.throttle(() => {this.forceUpdate()}, 200);
  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.filters != this.props.filters) {
      this.forceUpdate(() => {
        this.manageScroll();
      });
    } else {
      this.manageScroll();
    }
  },
  shouldComponentUpdate: function(nextProps) {
    return this.props.filters != nextProps.filters;
  },
  cacheOutput: function(output) {
    let cachedOutput = fromJS(this.state.cachedOutput);
    if (this.state.cachedOutput.length > 2000) {
      cachedOutput = cachedOutput.shift();
    }
    cachedOutput = cachedOutput.push(output);
    this.setState({cachedOutput: cachedOutput.toJS()}, this.updateInnerHtml);
  },
  isFiltered: function(line) {
    if (this.props.filters.length == 0)
      return true;
    else {
      let splitedLine = line.substring(0, 30).split('|');
      if (splitedLine.length > 1) {
        let service = splitedLine[0];
        return this.props.filters.some(filter => service.indexOf(filter) != -1);
      } else {
        return true;
      }
    }
  },
  handleOutput: function(output) {
    this.scrolledDown = this.isScrolledDown();
    let outputString = output.toString();
    let splitedOutputString = outputString.split('\n');
    splitedOutputString.forEach((stringWithoutNewline) => {
      if (stringWithoutNewline != "")
        this.cacheOutput(stringWithoutNewline);
    });
  },

  isScrolledDown: function() {
    return this.logsContainer.scrollHeight - this.logsContainer.clientHeight == this.logsContainer.scrollTop;
  },
  manageScroll: function() {
    if (this.scrolledDown)
      this.scrollDown();
  },
  scrollDown: function() {
    this.logsContainer.scrollTop = this.logsContainer.scrollHeight - this.logsContainer.clientHeight;
  },
  getHTMLOutput: function() {
    var convert = new Convert();
    return this.state.cachedOutput
            .filter(this.isFiltered)
            .map((str) => convert.toHtml(str))
            .join('<br>')
            .concat('<br>');
  },
  reload: function() {
    this.setState({cachedOutput: []}, function() {
      this.props.reload();
    });
  },
  render: function() {
    return (
      <div className="service-logs" style={{flexGrow: "1", paddingTop: "15px", paddingLeft: "15px", paddingBottom: "0px", paddingRight: "0px", display: "flex", flexDirection: "column", flex: "1", position: 'relative'}}>
        <div style={{overflowY: "scroll", flexGrow: "1", paddingRight: "5px", whiteSpace: "nowrap"}} ref={(ref) => this.logsContainer = ref} dangerouslySetInnerHTML={{__html: this.getHTMLOutput()}}>

        </div>
        <div style={{position: 'absolute', top: '5', right: '5'}}>
          <button type="button" className="compose-control" onClick={this.reload}>Reload</button>
          <button type="button" className="compose-control" onClick={this.props.stop}>Stop</button>
        </div>
      </div>
    );
  }
});

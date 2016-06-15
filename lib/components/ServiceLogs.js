'use babel'

import {React} from 'react-for-atom';
import Convert from 'ansi-to-html';
import child_process from 'child_process';
import {fromJS} from 'immutable';

export default React.createClass({
  getInitialState: function() {
    return {};
  },
  getDefaultProps: function() {
    return {
      output: [],
      filters: [],
      reload: function() {

      },
      stop: function() {

      },
      clear: function() {

      },
    };
  },
  componentDidMount: function() {

  },
  componentDidUpdate: function(prevProps) {
    if (prevProps.filters != this.props.filters) {
      this.forceUpdate(() => {
        this.scrollDown();
      });
    } else {
      this.manageScroll();
    }
  },
  componentWillUpdate: function() {
    this.scrolledDown = this.isScrolledDown();
  },
  isFiltered: function(line) {
    if (this.props.filters.length == 0)
      return true;
    else {
      let splitedLine = line.substring(0, 40).split('|');
      if (splitedLine.length > 1) {
        let service = splitedLine[0];
        return this.props.filters.some(filter => service.indexOf(filter) != -1);
      } else {
        return true;
      }
    }
  },
  isScrolledDown: function() {
    return this.logsContainer.scrollHeight - this.logsContainer.clientHeight == this.logsContainer.scrollTop;
  },
  scrollDown: function() {
    this.logsContainer.scrollTop = this.logsContainer.scrollHeight - this.logsContainer.clientHeight;
  },
  manageScroll: function() {
    if (this.scrolledDown)
      this.scrollDown();
  },
  getHTMLOutput: function(output) {
    var convert = new Convert();
    return output
            .filter(this.isFiltered)
            .map((str) => convert.toHtml(str))
            .join('<br>')
            .concat('<br>');
  },
  render: function() {
    return (
      <div className="service-logs" style={{flexGrow: "1", paddingTop: "15px", paddingLeft: "15px", paddingBottom: "0px", paddingRight: "0px", display: "flex", flexDirection: "column", flex: "2", position: 'relative'}}>
        <div style={{overflowY: "scroll", flexGrow: "1", paddingRight: "5px", whiteSpace: "nowrap"}} ref={(ref) => this.logsContainer = ref} dangerouslySetInnerHTML={{__html: this.getHTMLOutput(this.props.output)}}>

        </div>
        <div style={{position: 'absolute', top: '5', right: '5'}}>
          <button type="button" className="compose-control text" onClick={this.props.clear}>Clear</button>
          <button type="button" className="compose-control text" onClick={this.props.reload}>Reattach</button>
          <button type="button" className="compose-control text" onClick={this.props.stop}>Detach</button>
        </div>
      </div>
    );
  }
});

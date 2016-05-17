'use babel'
var {React} = require('react-for-atom');

var styles = {
  inputText: {
    width: "100%"
  },
};


module.exports = React.createClass({
  render: function() {
    return (
      <div>
        <span className="title">Remote Tag</span>
        <input type="text" ref={elem => this.text = elem} className="native-key-bindings" style={styles.inputText} placeholder="Commit Message"/>
      </div>
    );
  }
});

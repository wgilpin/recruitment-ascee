import React from 'react';
import PropTypes from 'prop-types';
import addImg from '../images/send.png';


const propTypes = {
  onSubmit: PropTypes.func,
  log: PropTypes.bool,
};

const defaultProps = {};

const styles = {
  inOuter: {
    display: 'table',
    margin: '4px',
    width: '100%',
    borderRadius: '4px',
    borderColor: '#555',
    borderWidth: '2px',
    borderStyle: 'none',

  },
  inInner: {
    display: 'table-row',
  },
  inButton: {
    display: 'table-cell',
    height: '30px',
    width: '30px',
    backgroundColor: '#0000',
    float: 'right',
    border: 'none',
  },
  input: {
    display: 'table-cell',
    borderColor: '#555',
    backgroundColor: '#222',
    top: '6px',
    borderWidth: '1px',
    width: '85%',
    borderRadius: '2px',
    textAlign: 'left',
    height: '30px',
    color: 'white',
    paddingLeft: '6px',
  },
  inImg:{
    width:'30px',
    backgroundColor: '#0000',
    display: 'inline',
    marginLeft: '4px',
    position: 'relative',
    top: '11px',
  },
  textArea: {
    width: '85%',
    display: 'table-cell',
    borderColor: '#555',
    color: 'white',
    backgroundColor: '#222',
    top: '6px',
    borderWidth: '1px',
    borderRadius: '2px',
    textAlign: 'left',
    marginTop: '6px',
  }
}

export default class NoteInput extends React.Component {

  constructor(props) {
    super(props);
    this.textInput = React.createRef();
    this.textArea = React.createRef();
  }

  handleSubmit = () => {
    if (this.textInput.current.value.length > 0) {
      if (this.props.onSubmit) {
        const title = this.props.log ? this.textInput.current.value : '';
        const text  = this.props.log ?
          this.textArea.current.value :
          this.textInput.current.value;
        this.props.onSubmit(text, title);
        this.textInput.current.value = '';
        if (this.textArea.current){
          this.textArea.current.value = '';
        }
      }
    }
  }

  handleKeyPress = (event) => {
    if(event.key === 'Enter'){
      if (this.props.log) {
        if (this.textInput.current.value.length > 0) {
          this.textArea.current.focus();
        }
      } else {
        this.handleSubmit();
      }
    }
  }

  render() {
    const inputStyles = styles.input;
    const imgStyles = styles.inImg;
    if (this.props.log) {
      inputStyles['marginRight'] = '30px';
      imgStyles['position'] = 'inherited';
    }
    const placeHolder = this.props.log ? 'Enter Log Description' : 'Add a note';
    return (
      <div style={styles.inOuter}>
      <div style={styles.inInner}>
        <input
          ref={this.textInput}
          style={styles.input}
          type="text"
          placeholder={placeHolder}
          onKeyPress={this.handleKeyPress}
        />
        {this.props.log
          && <textarea
            style={styles.textArea}
            ref={this.textArea}
            placeholder="paste logs here"
            rows="10"
          />
        }
        <img onClick={this.handleSubmit} style={imgStyles} alt="Add" src={addImg} />
      </div>
    </div>
    );
  }
}

NoteInput.propTypes = propTypes;
NoteInput.defaultProps = defaultProps;
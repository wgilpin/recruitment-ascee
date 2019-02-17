import React from 'react';
import PropTypes from 'prop-types';
import addImg from '../images/add.gif';


const propTypes = {};

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
    backgroundColor: '#111',
    top: '6px',
    borderWidth: '1px',
    width: '85%',
    borderRadius: '2px',
    textAlign: 'left',
    height: '30px',
  },
  inImg:{
    width:'30px',
    backgroundColor: '#0000',
    display: 'inline',
    position: 'relative',
    top: '11px',
  }
}

export default class NoteInput extends React.Component {
  render() {
    return (
      <div style={styles.inOuter}>
      <div style={styles.inInner}>
        <input style={styles.input} type="text" placeholder="Add a note"></input>
        <img style={styles.inImg} alt="Add" src={addImg} />
      </div>
    </div>
    );
  }
}

 NoteInput.propTypes = propTypes;
 NoteInput.defaultProps = defaultProps;
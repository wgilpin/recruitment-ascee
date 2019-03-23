import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Styles from './common/Styles';



const propTypes = {
  onConfirm: PropTypes.func,
  text: PropTypes.string,
};

const styles = {
  ...Styles.styles,
  modal: {
    backgroundColor: '#111',
    overlay: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)'
    },
    content: {
      border: '1px solid #ccc',
      background: '#111',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '4px',
      outline: 'none',
      padding: '20px'
    },
    title: {
      color: Styles.themeColors.primary,
      fontWeight: 600,
    }
  }
}

export default class Confirm extends React.Component {
  onClick = () => {
    if (this.props.onConfirm) {
      this.props.onConfirm();
    }
  }

  render() {
    return <ReactModal isOpen={true} style={styles.modal}>
        <h2 style={styles.modal.title}>
          {this.props.text}
        </h2>
        <p style={styles.modal.text}>Are you sure?</p>
        <button
          style={styles.smallSecondary}
          onClick={() => this.props.onClose()}
        >
          No
        </button>
        <button style={styles.smallPrimary} onClick={this.onClick}>
          Yes
        </button>
      </ReactModal>
  }
}

Confirm.propTypes = propTypes;
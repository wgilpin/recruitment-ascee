import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Styles from './common/Styles';

const propTypes = {
  onClose: PropTypes.func,
  text: PropTypes.string,
};

const styles = {
  ...Styles.styles,
  modal: {
    backgroundColor: '#111',
    overlay: {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
    content: {
      border: '1px solid #ccc',
      background: '#111',
      overflow: 'auto',
      WebkitOverflowScrolling: 'touch',
      borderRadius: '4px',
      outline: 'none',

      width: '300px',
      height: 'fit-content',
      padding: '20px',
      marginLeft: 'auto',
      marginRight: 'auto',

    },
    title: {
      color: Styles.themeColors.primary,
      fontWeight: 600,
      textAlign: 'center',
    },
    buttons: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'fit-content',
    }
  },
};

export default class Alert extends React.Component {
  onClick = () => {
    if (this.props.onClose) {
      this.props.onClose();
    }
  };

  render() {
    return (
      <ReactModal isOpen={true} style={styles.modal}>
        <h2 style={styles.modal.title}>{this.props.text}</h2>
        <div style={styles.modal.buttons}>
          <button style={styles.smallPrimary} onClick={this.onClick}>
            Close
          </button>
        </div>
      </ReactModal>
    );
  }
}

Alert.propTypes = propTypes;

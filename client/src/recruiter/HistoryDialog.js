import React from 'react';
import PropTypes from 'prop-types';
import ReactModal from 'react-modal';
import Styles from '../common/Styles';
import NotesHistory from './../notes/NotesHistory';

const propTypes = {
  characterName: PropTypes.string,
  appHistory: PropTypes.object,
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
    text: {
      textAlign: 'center',
    },
    buttons: {
      marginLeft: 'auto',
      marginRight: 'auto',
      width: 'fit-content',
    },
    centered: {
      marginLeft: 'auto',
      marginRight: 'auto',
      textAlign: 'center',
    }
  },
};

export default class HistoryDialog extends React.Component {
  render() {
    ReactModal.setAppElement(document.documentElement);
    const { appHistory } = this.props;
    return (
      <ReactModal isOpen={true} style={styles.modal}>
      <div style={styles.modal.centered}>
        <h2 style={styles.modal.text}>Application History</h2>
        <h1 style={styles.modal.title}>{this.props.characterName}</h1>
        <NotesHistory
          style={styles.tabBody}
          notes={appHistory.notes}
          recruiter_name={appHistory.recruiter_name}
          status={appHistory.status}
        />
        <button
          style={{...styles.primaryButton, ...styles.modal.centered }}
          onClick={this.props.onCloseHistory}
        >
          Close
        </button>
      </div>
      </ReactModal>
    );
  }
}

HistoryDialog.propTypes = propTypes;

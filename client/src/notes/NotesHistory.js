import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import Styles from '../common/Styles';
import Chat from './Chat';
import NoteInput from './NoteInput';

const propTypes = {
  notes: PropTypes.array,
  recruiterName: PropTypes.string,
  status: PropTypes.string,
};

const defaultProps = {
  notes: [],
  recruiterName: '',
  status: '',
};

const styles = {
  outer: {
    display: 'flex',
    maxWidth: '800px',
  },
  column: {
    flex: '50%',
    minWidth: '300px',
    padding: '12px',
  },
  h2: {
    color: Styles.themeColors.primary,
  },
  appStatus: {
    color: 'orange',
    marginRight: '6px',
  },
  appRecruiter: {
    fontWeight: 500,
  },
};

export default class NotesHistory extends React.Component {
  static sortNotes = (a, b) => moment(a.timestamp) - moment(b.timestamp);

  static getDerivedStateFromProps(props, state) {
    const notes = props.notes
      .filter(note => (note.title || '').length === 0)
      .sort(NotesHistory.sortNotes);
    const logs = props.notes
      .filter(note => (note.title || '').length > 0)
      .sort(NotesHistory.sortNotes);
    return { notes, logs, timestamp: (notes[0] || []).timestamp };
  }

  render() {
    return (
      <React.Fragment>
        <div style={styles.appRecruiter}>{this.props.recruiter_name}</div>
        <div>
          <span style={styles.appStatus}>{this.props.status}</span>
          {moment(this.state.timestamp).calendar()}
        </div>
        <div>{moment(this.state.timestamp).format('ddd, D MMM YY HH:MM GMT')}</div>
        <div style={styles.outer}>
          <div style={styles.column}>
            <h2 style={styles.h2}>Notes</h2>
            <Chat items={this.state.notes} />
            <NoteInput onSubmit={this.handleAddNote} />
          </div>
          <div style={styles.column}>
            <h2 style={styles.h2}>Chat Transcripts</h2>
            <Chat items={this.state.logs} />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

NotesHistory.propTypes = propTypes;
NotesHistory.defaultProps = defaultProps;

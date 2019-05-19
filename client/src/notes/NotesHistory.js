import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import NotesColumns from './NotesColumns';

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
  expand = onlyShow => {
    this.setState({ onlyShow: this.state.onlyShow ? false : onlyShow });
  };

  render() {
    return (
      <React.Fragment>
        <div style={styles.appRecruiter}>{this.props.recruiter_name}</div>
        <div>
          <span style={styles.appStatus}>{this.props.status}</span>
          {moment(this.state.timestamp).calendar()}
        </div>
        <div>
          {moment(this.state.timestamp).format('ddd, D MMM YY HH:MM GMT')}
        </div>
        <NotesColumns
          notes={this.state.notes}
          logs={this.state.logs}
          readonly={true}
        />
      </React.Fragment>
    );
  }
}

NotesHistory.propTypes = propTypes;
NotesHistory.defaultProps = defaultProps;

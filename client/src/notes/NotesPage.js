import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import FetchData from '../common/FetchData';
import Loader from 'react-loader-spinner';

import NotesColumns from './NotesColumns';

const propTypes = {
  alt: PropTypes.number,
};

const defaultProps = {};

export default class NotesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  sortNotes = (a, b) => moment(a.timestamp) - moment(b.timestamp);

  fetchNotes() {
    new FetchData({
      id: this.props.targetId,
      scope: 'recruits',
      param1: 'notes',
    })
      .get()
      // Set the  `notes` and 'logs' lists
      .then(data => {
        this.setState({ loading: false });
        console.log(`fetched notes`, data);
        const notes = data.info
          .filter(note => (note.title || '').length === 0)
          .sort(this.sortNotes);
        const logs = data.info
          .filter(note => (note.title || '').length > 0)
          .sort(this.sortNotes);
        this.setState({ notes, logs, showAddLog: false });
      });
  }

  componentDidMount() {
    console.log('set global');
    this.fetchNotes();
  }

  handleAddNote = (text, title) => {
    const scope = title ? 'recruits/add_chat_log' : 'recruits/add_note';
    new FetchData({ id: this.props.targetId, scope })
      .put({ text, title: title || '' })
      .then(() => {
        // TODO: check for errors
        this.fetchNotes();
      });
  };

  render() {
    if (this.state.loading) {
      console.log('loading');
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    console.log('loaded');
    return (
      <NotesColumns
        canAddLog
        notes={this.state.notes}
        logs={this.state.logs}
        onAddNote={this.handleAddNote}
      />
    );
  }
}

NotesPage.propTypes = propTypes;
NotesPage.defaultProps = defaultProps;

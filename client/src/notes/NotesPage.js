import React from 'react';
import PropTypes from 'prop-types';
import FetchData from '../common/FetchData';
import Loader from 'react-loader-spinner';
import Styles from '../common/Styles';
import Chat from './Chat';
import NoteInput from './NoteInput';
import FabButton from '../common/fabButton';


const propTypes = {
  alt: PropTypes.number,
};

const defaultProps = {};

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
  fab: {
    position: 'relative',
    top: '0px',
    float: 'right',
  }
}

export default class NotesPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  fetchNotes(){
    new FetchData({ id: this.props.targetId, scope: 'recruits', param1: 'notes' })
      .get()
      // Set the  `notes` and 'logs' lists
      .then(data => {
        this.setState({ loading: false });
        console.log(`fetched notes`, data);
        const notes = data.info.filter(note => (note.title || '').length === 0);
        const logs = data.info.filter(note => (note.title || '').length > 0);
        this.setState({ notes, logs, showAddLog: false });
      });
  }

  componentDidMount() {
    console.log('set global')
    this.fetchNotes();
  }

  handleAddNote = (text, title) => {
    const scope = title ? 'recruits/add_chat_log' : 'recruits/add_note';
    new FetchData({ id: this.props.targetId, scope })
      .put({ text, title: title || '' })
      .then(() => {
        // TODO: check for errors
        this.fetchNotes();
      })
  }

  clickAddLog = () => {
    this.setState({ showAddLog: true })
  }

  render() {
    if (this.state.loading) {
      console.log('loading')
      return <Loader type="Puff" color="#01799A" height="100" width="100" />
    }
    console.log('loaded')
    return (
      <div style={styles.outer}>
        <div style={styles.column}>
          <h2 style={styles.h2}>Notes</h2>
          <Chat items={this.state.notes} />
          <NoteInput onSubmit={this.handleAddNote}/>
        </div>
        <div style={styles.column}>
          <h2 style={styles.h2}>Chat Transcripts</h2>
          <Chat items={this.state.logs} />
          <div>
            { !this.state.showAddLog &&
              <FabButton
                icon="add"
                color="#c00"
                size="40px"
                style={styles.fab}
                onClick={this.clickAddLog}/>
            }
            { this.state.showAddLog &&
              <NoteInput log="true" onSubmit={this.handleAddNote}/>
            }
          </div>
        </div>
      </div>
    );
  }
}

NotesPage.propTypes = propTypes;
NotesPage.defaultProps = defaultProps;

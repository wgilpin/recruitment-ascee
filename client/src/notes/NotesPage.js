import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import FetchData from '../common/FetchData';
import Loader from 'react-loader-spinner';
import Styles from '../common/Styles';
import Chat from './Chat';
import NoteInput from './NoteInput';
import FabButton from '../common/fabButton';
import arrowRight from '../images/arrow_forward.png';
import arrowLeft from '../images/arrow_back.png';

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
  all: {
    flex: '100%',
    minWidth: '600px',
    padding: '12px',
  },
  h2: {
    color: Styles.themeColors.primary,
  },
  fab: {
    position: 'relative',
    top: '0px',
    float: 'right',
  },
  img: {
    cursor: 'pointer',
    position: 'relative',
    top: '4px',
    paddingLeft: '6px',
    paddingRight: '6px',
  }
};

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

  clickAddLog = () => {
    this.setState({ showAddLog: true });
  };

  expand = onlyShow => {
    this.setState({ onlyShow: this.state.onlyShow ? false : onlyShow });
  };

  render() {
    if (this.state.loading) {
      console.log('loading');
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    console.log('loaded');
    const { onlyShow } = this.state;
    return (
      <div style={styles.outer}>
        {onlyShow !== 'right' && (
          <div style={onlyShow ? styles.all : styles.column}>
            <h2 style={styles.h2}>
              Notes
              <img
              style={styles.img}
                src={onlyShow ? arrowLeft : arrowRight}
                alt=""
                onClick={() => this.expand('left')}
              />
            </h2>
            <Chat items={this.state.notes} />
            <NoteInput onSubmit={this.handleAddNote} />
          </div>
        )}
        {this.state.onlyShow !== 'left' && (
          <div style={onlyShow ? styles.all : styles.column}>
            <h2 style={styles.h2}>
              Chat Transcripts
              <img
              style={styles.img}
              src={onlyShow ? arrowRight : arrowLeft}
                alt=""
                onClick={() => this.expand('right')}
              />
            </h2>
            <Chat items={this.state.logs} />
            <div>
              {!this.state.showAddLog && (
                <FabButton
                  icon="add"
                  color="#c00"
                  size="40px"
                  style={styles.fab}
                  onClick={this.clickAddLog}
                />
              )}
              {this.state.showAddLog && (
                <NoteInput log="true" onSubmit={this.handleAddNote} />
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}

NotesPage.propTypes = propTypes;
NotesPage.defaultProps = defaultProps;

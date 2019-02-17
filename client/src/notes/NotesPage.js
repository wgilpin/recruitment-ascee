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
    width: '100%',
  },
  column: {
    flex: '50%',
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

  componentDidMount() {
    console.log('set global')
    this.setState(
      { notes: [
        {
          author_name: "William Gilpin",
          body: 'jhg Kjhg kjhg kjygfkuyfkuyf kuyf kjfy kjhf kuytf k',
          timestamp: 'Yesterday',
        },
        {
          author_name: "William Gilpin",
          body: "Surveys show weakening industrial production. The far-Right is gaining attention, just as the pressure from regional separatists – whom Sánchez needs to form a Left-wing coalition government – to get what they deem their fair slice of the spending pie, proves unrelenting. The trial of Catalan leaders has been a decisive factor in pro-separatist parties deciding not to save Sánchez’s Budget, which should have been passed in November.",
          timestamp: 'Last week',
        },
      ], logs: [
        {
          author_name: "Katie Snape",
          title: 'hurfy blurf',
          body: 'jhg Kjhg kjhg kjygfkuyfkuyf kuyf kjfy kjhf kuytf k',
          timestamp: 'Yesterday',
        },
        {
          author_name: "Katie Snape",
          title: 'Tornado F3',
          body: "Surveys show weakening industrial production. The far-Right is gaining attention, just as the pressure from regional separatists – whom Sánchez needs to form a Left-wing coalition government – to get what they deem their fair slice of the spending pie, proves unrelenting. The trial of Catalan leaders has been a decisive factor in pro-separatist parties deciding not to save Sánchez’s Budget, which should have been passed in November.",
          timestamp: 'Last week',
        },
      ] });
      /*
      new FetchData({ id: this.props.alt, scope: 'recruits', param1: 'notes' })
        .get()
        // Set the global `recruits` list, and set no recruit selected
        .then(data => {
          this.setState({ loading: false });
          console.log(`fetched notes`);

          return { notes: data.info.notes, logs: data.info.logs }
        }))
        */
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
          <NoteInput />
        </div>
        <div style={styles.column}>
          <h2 style={styles.h2}>Chat Transcripts</h2>
          <Chat items={this.state.logs} />
          <div>
            <FabButton icon="add" color="#c00" size="40px" style={styles.fab}/>
          </div>
        </div>
      </div>
    );
  }
}

 NotesPage.propTypes = propTypes;
 NotesPage.defaultProps = defaultProps;
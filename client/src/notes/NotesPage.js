import React from 'react';
import PropTypes from 'prop-types';
import FetchData from '../common/FetchData';
import Loader from 'react-loader-spinner';
import Styles from '../common/Styles';
import Chat from './Chat';


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
          body: "new FetchData({ id: this.props.alt, scope: 'recruits', param1: 'notes' })",
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
          body: "new FetchData({ id: this.props.alt, scope: 'recruits', param1: 'notes' })",
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
      return [<Loader type="Tailspin" color="#01799A" height="100" width="100" />,
      <Loader type="Rings" color="#01799A" height="100" width="100" />];
    }
    console.log('loaded')
    return (
      <div style={styles.outer}>
        <div style={styles.column}>
          <h2 style={styles.h2}>Notes</h2>
          <Chat items={this.state.notes} />
        </div>
        <div style={styles.column}>
          <h2 style={styles.h2}>Chat Transcripts</h2>
          <Chat items={this.state.logs} />
        </div>
      </div>
    );
  }
}

 NotesPage.propTypes = propTypes;
 NotesPage.defaultProps = defaultProps;
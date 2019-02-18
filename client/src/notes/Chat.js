import React from 'react';
import PropTypes from 'prop-types';
import Note from './Note';

const propTypes = {
  show: PropTypes.string,
};

const defaultProps = {};

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  buildNote({note_id, author_name, title, body, timestamp}) {
    return <Note id={note_id} author={author_name} title={title} body={body} timestamp={timestamp}/>
  }

  render() {
    if (!this.props.items){
      return null;
    }
    console.log('got data', this.props.show)
    return (
      <React.Fragment>
        {this.props.items
          .map(note => this.buildNote(note))}
      </React.Fragment>
    );
  }
}

Chat.propTypes = propTypes;
Chat.defaultProps = defaultProps;
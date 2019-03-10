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

  buildNote({id, author, title, text, timestamp}) {
    return <Note id={id} author={author} title={title} body={text} timestamp={timestamp}/>
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
import React from 'reactn';
import PropTypes from 'prop-types';
import relativeDate from 'tiny-relative-date';

const propTypes = {
  id: PropTypes.number,
  kind: PropTypes.string,
};

const defaultProps = {};

const styles = {
  outer: {
    margin: '4px',
    borderRadius: '4px',
    borderColor: '#555',
    borderWidth: '2px',
    borderStyle: 'solid',
  },
  title: {
    backgroundColor: '#111',
    fontWeight: 600,
    borderColor: '#555',
    margin: '6px',
    borderWidth: '1px',
    // width: '100%',
    borderRadius: '0px',
    height: '24px',
  },
  body: {
    borderColor: '#555',
    backgroundColor: '#111',
    padding: '6px',
    borderWidth: '1px',
    // width: '100%',
    borderRadius: '0px',
    textAlign: 'left',
  },
  date: {
    fontSize: 'small',
    fontStyle: 'italic',
    paddingBottom: '4px',
  },
  author: {
    fontSize: 'small',
    fontWeight: '600',
  }
}
export default class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    console.log(`render note ${this.props.id} ${this.props.title}`)
    const { author, title, timestamp, body} = this.props;
    const bodyLines = body.split('\n');
    return (
      <div style={styles.outer}>
        {title && title.length > 0 &&
        <div style={styles.title}>
          {title}
        </div>}
        <div style={styles.body}>
          <div style={styles.author}>{author}</div>
          <div style={styles.date}>{relativeDate(timestamp, new Date())}</div>
            {bodyLines.map(line => <div>{line}</div>)}
        </div>
      </div>
    );
  }
}

 Note.propTypes = propTypes;
 Note.defaultProps = defaultProps;
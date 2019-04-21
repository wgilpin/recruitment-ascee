import React from 'reactn';
import PropTypes from 'prop-types';
import moment from 'moment';
import collapsedImg from '../images/collapsed.png';
import expandedImg from '../images/expanded.png';
import editImg from '../images/edit-white.svg';

const propTypes = {
  id: PropTypes.number,
  kind: PropTypes.string,
  can_edit: PropTypes.bool,
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
    overflow: 'hidden',
    float: 'left',
  },
  expandBtn: {
    float: 'right',
    margin: '6px',
    color: '#01799A',
  },
  titleBody: {
    textOverflow: 'ellipsis',
    fontWeight: 200,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    fontSize: 'small',
  },
  editBtn: {
    float: 'right',
    marginTop: '6px',
    marginRight: '6px',
    cursor: 'pointer',
  },
};
export default class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      editing: false,
    };
  }

  handleExpandClick = e => {
    this.setState({ collapsed: !this.state.collapsed });
    e.preventDefault();
  };

  expansionButton = () => {
    return this.state.collapsed ? (
      <img
        style={styles.expandBtn}
        src={collapsedImg}
        alt="-"
        onClick={this.handleExpandClick}
      />
    ) : (
      <img
        style={styles.expandBtn}
        src={expandedImg}
        alt="+"
        onClick={this.handleExpandClick}
      />
    );
  };

  editNote = () => {
    this.setState({ collapsed: false, editing: true });
  };

  render() {
    const { author, title, body } = this.props;
    const bodyLines = body.split('\n');
    return (
      <div style={styles.outer}>
        {title && title.length > 0 && <div style={styles.title}>{title}</div>}
        <div style={styles.body}>
          <div style={styles.author}>
            {author}
            {this.props.can_edit && (
              <img
                style={styles.editBtn}
                alt="edit"
                onClick={this.editNote}
                src={editImg}
              />
            )}
            &emsp;
          </div>
          <div style={styles.titleBody}>
            {this.state.collapsed && bodyLines[0]}{' '}
          </div>
          <div style={styles.date}>
            {moment(this.props.timestamp).calendar(null, {
              sameElse: 'D MMM YYYY',
            })}
            {this.expansionButton()}
          </div>
          {this.state.collapsed ||
            (this.state.editing ? (
              <textarea style={styles.editBox} value={bodyLines} />
            ) : (
              bodyLines.map(line => <div>{line}</div>)
            ))}
        </div>
      </div>
    );
  }
}

Note.propTypes = propTypes;
Note.defaultProps = defaultProps;

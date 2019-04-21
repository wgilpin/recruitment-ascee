import React from 'reactn';
import PropTypes from 'prop-types';
import moment from 'moment';
import TextareaAutosize from 'react-autosize-textarea';
import editImg from '../images/edit-white.svg';
import saveImg from '../images/check.png';
import closeImg from '../images/close.png';
import FetchData from '../common/FetchData';

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
    width: '16px',
  },
  editBox: {
    textAlign: 'left',
    backgroundColor: '#222',
    color: 'white',
    width: '95%',
    border: 'none',
  },
  line: {
    textAlign: 'left',
  },
};
export default class Note extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
      editing: false,
      dirty: false,
      text: '',
    };
    this.textRef = React.createRef();
  }

  componentDidMount() {
    this.setState({ text: this.props.body });
  }
  handleExpandClick = e => {
    if (!this.state.editing) {
      this.setState({ collapsed: !this.state.collapsed });
    }
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
  };

  editNote = e => {
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    if (this.state.editing) {
      this.setState({ editing: false });
    } else {
      this.setState({ collapsed: false, editing: true });
    }
  };

  saveNote = () => {
    new FetchData({ scope: 'recruits/edit_note', param2: this.props.id })
      .put({
        note_id: this.props.id,
        text: this.state.text,
      })
      .then(() => window.alert('saved'));
  };

  getButtons() {
    const editBtn = (
      <img
        style={styles.editBtn}
        alt="edit"
        onClick={this.editNote}
        src={editImg}
      />
    );
    const saveBtn = (
      <img
        style={styles.editBtn}
        alt="save"
        onClick={this.saveNote}
        src={saveImg}
      />
    );
    const cancelBtn = (
      <img
        style={styles.editBtn}
        alt="close"
        onClick={this.editNote}
        src={closeImg}
      />
    );
    if (this.props.can_edit) {
      if (this.state.editing) {
        if (this.state.dirty) {
          return (
            <React.Fragment>
              {cancelBtn}
              {saveBtn}
            </React.Fragment>
          );
        } else {
          return <React.Fragment>{cancelBtn}</React.Fragment>;
        }
      }
      return <React.Fragment>{editBtn}</React.Fragment>;
    }
    return null;
  }

  handleTextEdited = () => {
    this.setState({ dirty: true, text: this.textRef.current.value });
  };

  editNote = () => {
    this.setState({ collapsed: false, editing: true });
  };

  render() {
    const { author, title } = this.props;
    const bodyLines = this.state.text.split('\n');
    const bodyText = this.state.text;
    return (
      <div style={styles.outer}>
        {title && title.length > 0 && (
          <div onClick={this.handleExpandClick} style={styles.title}>
            {title}
          </div>
        )}
        <div style={styles.body} onClick={this.handleExpandClick}>
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
            {this.getButtons()}
          </div>
        </div>
        {this.state.collapsed ||
          (this.state.editing ? (
            <TextareaAutosize
              onChange={this.handleTextEdited}
              rows={2}
              style={styles.editBox}
              value={bodyText}
              onClick={e => e.preventDefault()}
              ref={this.textRef}
            />
          ) : (
            bodyLines.map(line => <div style={styles.line}>{line}</div>)
          ))}
      </div>
    );
  }
}

Note.propTypes = propTypes;
Note.defaultProps = defaultProps;

import React from 'react';
import PropTypes from 'prop-types';
import Styles from '../common/Styles';
import FabButton from '../common/fabButton';
import Chat from './Chat';
import NoteInput from './NoteInput';
import arrowRightImg from '../images/arrow_forward.png';
import arrowLeftImg from '../images/arrow_back.png';
import columnsImg from '../images/columns.png';

const propTypes = {
  canAddLog: PropTypes.func,
  notes: PropTypes.array,
  logs: PropTypes.array,
  onAddNote: PropTypes.func,
  onClickAddLog: PropTypes.func,
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
  img: {
    cursor: 'pointer',
    position: 'relative',
    top: '4px',
    paddingLeft: '6px',
    paddingRight: '6px',
  },
};
export default class NotesColumns extends React.Component {
  constructor(props) {
    super(props);
    this.state={
      onlyShow: false,
    }
  }

  expand = onlyShow => {
    this.setState({ onlyShow: this.state.onlyShow ? false : onlyShow });
  };

  clickAddLog = () => {
    this.setState({ showAddLog: true });
  };

  render() {
    const { onlyShow } = this.state;
    const { notes, logs } = this.props;
    return (
      <React.Fragment>
        <div style={styles.outer}>
          {onlyShow !== 'right' && (
            <div style={styles.column}>
              <h2 style={styles.h2}>
                Notes
                <img
                  style={styles.img}
                  src={onlyShow ? columnsImg : arrowRightImg}
                  alt=""
                  onClick={() => this.expand('left')}
                />
              </h2>
              <Chat items={this.props.notes} />
              <NoteInput onSubmit={this.props.onAddNote} />
            </div>
          )}
          {this.state.onlyShow !== 'left' && (
            <div style={styles.column}>
              <h2 style={styles.h2}>
                Chat Transcripts
                <img
                  style={styles.img}
                  src={onlyShow ? columnsImg : arrowLeftImg}
                  alt=""
                  onClick={() => this.expand('right')}
                />
              </h2>
              <Chat
                items={logs && logs.map(log => ({ ...log, can_edit: false }))}
              />
              <div>
                {!this.props.canAddLog && (
                  <FabButton
                    icon="add"
                    color="#c00"
                    size="40px"
                    style={styles.fab}
                    onClick={this.onClickAddLog}
                  />
                )}
                {this.state.showAddLog && (
                  <NoteInput log="true" onSubmit={this.clickAddNote} />
                )}
              </div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  }
}

NotesColumns.propTypes = propTypes;
NotesColumns.defaultProps = defaultProps;

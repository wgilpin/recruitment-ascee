import React from 'react';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';
import Styles from '../common/Styles';
import RoundImage from '../common/RoundImage';
import FetchData from '../common/FetchData';
import addImg from '../images/add_circle_outline_white_24dp.png';
import deleteImg from '../images/baseline_clear_white_24dp.png';

const propTypes = {
  kind: PropTypes.string,
};

const defaultProps = {
  kind: 'character',
};

const styles = {
  ...TableStyles.styles,
  ...Styles.styles,
  outer: {
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  listbox: {
    display: 'table',
    width: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  li: {
    height: '32px',
    borderStyle: 'solid',
    borderWidth: '1px',
  },
  textarea: {
    backgroundColor: Styles.themeColors.secondary,
    border: 'none',
    textAlign: 'left',
    padding: '8px',
    color: 'white',
  },
  input: {
    textAlign: 'left',
    width: '140px',
    height: '33px',
    padding: '4px',
    color: 'white',
    backgroundColor: Styles.themeColors.secondary,
    border: 'none',
  },
  centreDiv: {
    padding: '8px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  img: {
    width: '24px',
    height: '24px',
    cursor: 'pointer',
    paddingLeft: '12px',
    paddingRight: '12px',
  },
};

export default class FindItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: true,
      searchResults: {},
    };
    this.textInput = React.createRef();
    this.textArea = React.createRef();
  }

  searchOne = () => {
    const name = this.textInput.current.value;
    return this.search([name]);
  };

  searchMany = () => {
    const names = this.textArea.current.value;
    return this.search(names);
  };

  search(names) {
    return new FetchData({ id: this.state.kind, scope: 'names_to_ids' })
      .put({ category: this.props.kind, names })
      .then(data => {
        console.log(data.body);
        this.setState({ searchResults: data.info || [] });
      });
  }

  handleClickAddMany = () => {
    this.setState({ showAddMany: true, showInput: false });
  };

  handleAdd = id => {
    return new FetchData({ id: this.state.kind, scope: 'admin/list' }).put({
      replace: false,
      items: this.state.searchResults,
    });
  };

  handleReject = id => {
    const newList = Object.assign({}, this.state.searchResults);
    delete newList[id];
    this.setState({ searchResults: newList });
  };

  makeResultLine(name, id, idx) {
    const lineStyle = {
      ...(idx % 2 === 0 ? styles.isOdd : {}),
      ...styles.row,
    };
    const imgSrc = `https://image.eveonline.com/Character/${id}_64.jpg`;
    return (
      <div key={id} style={lineStyle}>
        {this.props.kind === 'character' && (
          <div style={styles.cell}>
            <RoundImage src={imgSrc} />
          </div>
        )}
        <div style={{ ...styles.cell, verticalAlign: 'middle' }}>{name}</div>
        <div
          style={{ ...styles.cell, verticalAlign: 'middle', cursor: 'pointer' }}
        >
          <img
            style={styles.img}
            src={addImg}
            onClick={() => this.handleAdd(id)}
            alt="add"
          />
          <img
            style={styles.img}
            src={deleteImg}
            onClick={() => this.handleReject(id)}
            alt="delete"
          />
        </div>
      </div>
    );
  }

  render() {
    return (
      <React.Fragment>
        {this.state.showInput && (
          <>
            <div style={styles.centreDiv}>
              <input
                type="text"
                placeholder="add name"
                style={styles.input}
                ref={this.textInput}
              />
              <button style={styles.smallPrimary} onClick={this.searchOne}>
                Search
              </button>
              <br />
              <button
                style={{ ...styles.linkButton, marginTop: '6px' }}
                onClick={this.handleClickAddMany}
              >
                Add Many
              </button>
            </div>
            <div style={styles.listbox}>
              {Object.entries(this.state.searchResults).map(
                ([id, name], idx) => {
                  return this.makeResultLine(name, id, idx);
                }
              )}
            </div>
          </>
        )}
        {!this.state.showInput && (
          <>
            <div style={styles.centreDiv}>
              <textarea
                rows="10"
                cols="60"
                style={styles.textarea}
                ref={this.textArea}
              />
              <br />
              <button style={styles.smallPrimary} onClick={this.searchMany}>
                Search
              </button>
            </div>
            <div style={styles.listbox}>
              {Object.entries(this.state.searchResults).map(
                ([id, name], idx) => {
                  return this.makeResultLine(name, id, idx);
                }
              )}
              <button style={styles.primaryButton} onClick={this.handleAddAll}>
                Add All
              </button>
            </div>
          </>
        )}
      </React.Fragment>
    );
  }
}

FindItem.propTypes = propTypes;
FindItem.defaultProps = defaultProps;

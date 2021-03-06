import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import TableStyles from '../evidence/TableStyles';
import Styles from '../common/Styles';
import RoundImage from '../common/RoundImage';
import FetchData from '../common/FetchData';
import addImg from '../images/add_circle_outline.png';
import deleteImg from '../images/clear.png';

const propTypes = {
  kind: PropTypes.string,
  onChange: PropTypes.func,
  fetcher: PropTypes.func,
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
  line: {
    height: '1px',
    color: 'grey',
  },
};

export default class FindItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showInput: true,
      searchResults: {},
      loading: false,
      noneFound: false,
    };
    this.textInput = React.createRef();
    this.textArea = React.createRef();
  }

  searchOne = () => {
    const name = this.textInput.current.value;
    return this.search([name]);
  };

  searchMany = () => {
    const names = this.textArea.current.value
      .split('\n')
      .filter(n => n.length > 0);
    return this.search(names);
  };

  appendResults(list) {
    return { ...this.state.searchResults, ...list };
  }

  doFetch = names => {
    const kind = this.props.kind === 'user' ? 'character' : this.props.kind;
    return new FetchData({ scope: 'names_to_ids' }).put({
      category: kind,
      names,
    });
  };

  search = names => {
    // if it's a user, need to search for character
    const fetcher = this.props.fetcher || this.doFetch;
    return fetcher(names).then(data => {
      const searchResults = this.appendResults(data.info) || [];
      this.setState({
        searchResults,
        noneFound: Object.keys(searchResults).length === 0,
      });
      this.removeMatches(data.info);
    });
  };

  handleClickAddMany = () => {
    this.setState({ showAddMany: true, showInput: false });
  };

  doAdd = items => {
    this.setState({ loading: true });
    return new FetchData({
      id: this.props.kind,
      scope: 'admin/list',
    })
      .put({ items })
      .then(res => {
        if (res.status === 'ok') {
          const newResults = { ...this.state.searchResults };
          items.forEach(it => delete newResults[it.name]);
          this.setState({ searchResults: newResults });
          if (this.props.onChange) {
            this.props.onChange();
          }
        }
        this.setState({ loading: false });
      })
      .catch(() => {
        this.setState({ loading: false });
      })
  };

  handleAddAll = () => {
    this.doAdd(
      Object.entries(this.state.searchResults).map(([name, id]) => ({
        name,
        id,
      }))
    );
  };

  handleAdd = (id, name) => {
    this.setState({ loading: true }, () => this.doAdd([{ id, name }]));
  };

  handleReject = name => {
    const newList = Object.assign({}, this.state.searchResults);
    delete newList[name];
    this.setState({ searchResults: newList });
  };

  removeMatches(matches) {
    if (!this.textArea.current) {
      return;
    }
    const oldList = this.textArea.current.value.toLowerCase().split('\n');
    Object.keys(this.state.searchResults).forEach(name => {
      const index = oldList.indexOf(name.toLowerCase());
      if (index !== -1) {
        oldList.splice(index, 1);
      }
    });
    this.textArea.current.value = oldList.join('\n');
  }

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
            onClick={() => this.handleAdd(id, name)}
            alt="add"
          />
          <img
            style={styles.img}
            src={deleteImg}
            onClick={() => this.handleReject(name)}
            alt="delete"
          />
        </div>
      </div>
    );
  }

  render() {
    const { showInput, searchResults } = this.state;

    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    return (
      <React.Fragment>
        {showInput && (
          <React.Fragment>
            <div style={styles.centreDiv}>
              <hr style={styles.line} />
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
            <div style={styles.listbox} id="results">
              {Object.entries(searchResults).map(([name, id], idx) => {
                return this.makeResultLine(name, id, idx);
              })}
            </div>
            {this.state.noneFound && <div>None Found</div>}
          </React.Fragment>
        )}
        {!showInput && (
          <React.Fragment>
            <div style={styles.centreDiv}>
              <hr style={styles.line} />
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
              {Object.entries(searchResults).map(([name, id], idx) => {
                return this.makeResultLine(name, id, idx);
              })}
            </div>
            {Object.keys(searchResults).length > 0 && (
              <div style={styles.listbox}>
                <button
                  style={styles.primaryButton}
                  onClick={this.handleAddAll}
                >
                  Add All
                </button>
              </div>
            )}
            {this.state.noneFound && <div>None Found</div>}
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
}

FindItem.propTypes = propTypes;
FindItem.defaultProps = defaultProps;

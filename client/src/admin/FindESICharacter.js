import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import SearchImg from '../images/magnifying_glass_24x24.png';
import FetchData from '../common/FetchData';
import TableStyles from '../evidence/TableStyles';
import RoundImage from '../common/RoundImage';

const propTypes = {
  iconList: PropTypes.array,
  onSelect: PropTypes.func,
  onButton: PropTypes.func,
};

const defaultProps = {
  iconList: [],
};

const primary = TableStyles.styles.themeColor.color;

const styles = {
  outer: {
    maxWidth: '350px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  searchOuter: {
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  searchInner: {
    display: 'inline-block',
    padding: '6px',
  },
  names: {
    float: 'left',
    width: '200px',
    verticalAlign: 'middle',
    position: 'unset',
    paddingTop: '4px',
  },
  searchButton: {
    borderStyle: 'none',
    backgroundColor: '#0000',
    padding: '6px',
  },
  smallButtonImg: {
    width: '20px',
    height: '20px',
  },
  h1: {
    color: primary,
  },
  h2: {
    padding: '8px',
    color: primary,
    fontWeight: 600,
  },
  userLine: {
    justifyItems: 'left',
    textAlign: 'left',
    padding: '12px',
  },
  moveButtons: {
    position: 'relative',
    top: '6px',
    paddingLeft: '24px',
  },
  searchInput: {
    backgroundColor: 'black',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'darkgray',
    padding: '6px',
    borderBottom: '1px white solid',
    borderLeft: 'black',
    borderRight: 'black',
    borderTop: 'black',
    color: 'white',
  },
  searchBtnOuter: {
    display: 'inline-block',
    cursor: 'pointer',
    marginRight: '12px',
  },
  tab: {
    width: '20%',
  },
  results: {
    width: '300px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
};

const doFetch = text => {
  return new FetchData({
    scope: 'character/find',
    param1: text,
  }).get();
};

export default class FindESICharacter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      searchText: '',
    };
  }

  handleSearch = async () => {
    console.log('handleSearch');
    
    if (this.state.searchText.length < 3) {
      return;
    }
    const fetcher = this.props.fetcher || doFetch;
    const searchResults = await fetcher(this.state.searchText);
    console.log('handlSearch', searchResults);
    
    this.setState({ searchResults, loading: false });
  };

  handleClick = (id, label, userName) => {
    this.props.onChange && this.props.onChange(id, label, userName);
  };

  makeSearchResultLine = (char, id) => {
    const imgSrc = `https://image.eveonline.com/Character/${id}_64.jpg`;
    return (
      <div style={{textAling: 'left'}} key={id}>
        <RoundImage style={{ position: 'relative', top: '6px' }} src={imgSrc} />
        &ensp;
        {char.name}
        {(this.props.iconList || []).map(icon => (
          <img
            key={icon.name}
            style={styles.moveButtons}
            src={icon.img}
            alt={icon.name}
            onClick={() => this.handleClick(char.user_id, icon.name, char.name)}
          />
        ))}
      </div>
    );
  };

  handleKeyPress = event => {
    const { value } = event.target;
    if (value.length > 0 && event.key === 'Enter') {
      this.setState({ searchResults: {}, searchText: value }, () => {
        this.handleSearch();
      })
    } else {
      this.setState({ searchResults: {}, searchText: value });
    }
  };

  render() {
    return (
      <React.Fragment>
        {this.state.loading && (
          <Loader type="Puff" color="#01799A" height="100" width="100" />
        )}
        {this.state.searchResults && (
          <div style={styles.results} id="results">
            {Object.entries(this.state.searchResults).map(([id, char]) =>
              this.makeSearchResultLine(char, id)
            )}
          </div>
        )}
        <div style={styles.searchOuter}>
          <div style={styles.searchInner}>
            <input
              onChange={this.handleKeyPress}
              onKeyDown={this.handleKeyPress}
              style={styles.searchInput}
              type="text"
              placeholder="search..."
            />
          </div>
          <div style={styles.searchBtnOuter}>
            <button onClick={this.handleSearch} style={styles.searchButton}>
              <img style={styles.smallButtonImg} src={SearchImg} alt="Search" />
            </button> 
          </div>
        </div>
      </React.Fragment>
    );
  }
}

FindESICharacter.propTypes = propTypes;
FindESICharacter.defaultProps = defaultProps;

import React from 'react';
import PropTypes from 'prop-types';
import SearchImg from '../images/magnifying_glass_24x24.png';
import FetchData from '../common/FetchData';
import TableStyles from '../evidence/TableStyles';

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
    maxWidth: '400px',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  searchOuter: {
    width: '50%',
    marginLeft: 'auto',
    marginRight: 'auto',
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
    float: 'right',
    cursor: 'pointer',
    marginRight: '12px',
  },
  tab: {
    width: '20%',
  }
};

export default class FindESICharacter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.textInput = React.createRef();

  }

  handleSearch = () => {
    if (this.textInput.current.value.length < 3){
      return;
    }
    new FetchData({ scope: 'character/find', param1: this.textInput.current.value })
      .get()
      .then(res => {
        this.setState({ searchResults: res });
      });
  }

  handleClick = (id, label, userName) => {
    this.props.onChange && this.props.onChange(id, label, userName);
  }

  makeSearchResultLine = (char) => {
    return (
      <div>
        {char.name}
        {(this.props.iconList || []).map((icon) => <img
          style={styles.moveButtons}
          src={icon.img}
          alt={icon.name}
          onClick={() => this.handleClick(char.user_id, icon.name, char.name)}
        />)}
      </div>
    );
  }

  handleKeyPress = (event) => {
    if(event.key === 'Enter') {
      if (this.textInput.current.value.length > 0) {
        this.handleSearch();
      }
    }
  }


  render() {
    return (
      <React.Fragment>
        <div style={styles.searchOuter}>
          <div style={styles.searchBtnOuter}>
            <button onClick={this.handleSearch} style={styles.searchButton}>
              <img style={styles.smallButtonImg} src={SearchImg} alt="Search" />
            </button>
          </div>
          <div style={{padding: '6px'}}>
            <input
              onKeyPress={this.handleKeyPress}
              style={styles.searchInput}
              type="text"
              placeholder="search..."
              ref={this.textInput}
              value={this.state.searchText}
            />
          </div>
        </div>
        {this.state.searchResults &&
          <div>
            {Object.values(this.state.searchResults).map(char =>
              this.makeSearchResultLine(char),
            )}
          </div>
        }
      </React.Fragment>
    );
  }
}

FindESICharacter.propTypes = propTypes;
FindESICharacter.defaultProps = defaultProps;
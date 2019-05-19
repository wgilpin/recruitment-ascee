import React from 'react';
import PropTypes from 'prop-types';
import ApplicationHistory from '../evidence/ApplicationHistory';
import FindESICharacter from '../admin/FindESICharacter';
import OpenImg from '../images/arrow_forward.png';

const propTypes = {
  id: PropTypes.number,
  onChoose: PropTypes.func,
};

const defaultProps = {};

const localStyles = {
  search: {
    marginTop: '20px',
  },
  section: {
    backgroundColor: '#333',
  },
};

export default class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showHistory: false,
    };
    this.roles = {};
  }

  handleOpenFromSearch = (id, _, name) => {
    this.setState({
      showHistory: id !== null,
      historyId: id,
    }, () => this.props.onChoose(id, null, name));
  };

  render() {
    return (
      <div style={localStyles.search}>
        <div style={{ ...localStyles.section, padding: '12px' }}>
          {this.state.showHistory && (
            <ApplicationHistory
              applicantId={this.state.historyId}
              onShowHistory={this.props.onShowHistory}
              showall
            />
          )}
          <div>
            <FindESICharacter
              onChange={this.handleOpenFromSearch}
              iconList={[{ name: 'open', img: OpenImg }]}
            />
          </div>
        </div>
      </div>
    );
  }
}

Search.propTypes = propTypes;
Search.defaultProps = defaultProps;

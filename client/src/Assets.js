import React from 'react';
import PropTypes from 'prop-types';
import FetchData from './FetchData';
import TableStyles from './TableStyles';

const propTypes = {
  alt: PropTypes.string,
  assetsList: PropTypes.array,
};

const defaultProps = {
};

const styles = TableStyles.styles;



export default class Assets extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'assets',
      assets: {},
      systems: {},
    };
  }

  jsonToSystemsList(json) {
    if (json && json.info) {
      this.assets = json.info;
      const keys = Object.keys(this.assets);
      this.setState({ assetCount: keys.length });
      keys.forEach((key) => {
        if (this.assets[key].location_type === 'system'){
          this.systems[key] = this.assets[key];
        }
      });
    }
  }

  onLoaded = data => {
    this.jsonToSystemsList(data);
    if (this.state.assetCount !== (this.state.assetsList || []).length) {
      this.setState({ assetsList: data })
    }
  }

  componentDidMount() {
    let fetch = new FetchData(
      { id: this.props.alt, scope: this.state.scope },
      this.onLoaded,
      this.onError
    );
    fetch.get();
  }

  static assetsLine(key, { amount, balance, description, second_party_id, date }) {
    let lineStyle =
      (key % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    let newdate = new Date(date);
    let theDate = date === "DATE" ? date : newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();

    return (
      <div style={styles.row} key={key}>
        <div style={lineStyle}>{amount.toLocaleString()}</div>
        <div style={lineStyle}>{balance.toLocaleString()}</div>
        <div style={lineStyle}>{description}</div>
        <div style={lineStyle}>{second_party_id.name}</div>
        <div style={lineStyle}>{theDate}</div>
      </div>
    )
  }

  static systemHeading(key, { name }) {
    return (
      <div style={styles.row} key={key}>
        <div style={styles.s}>{amount.toLocaleString()}</div>
        <div style={lineStyle}>{balance.toLocaleString()}</div>
        <div style={lineStyle}>{description}</div>
        <div style={lineStyle}>{second_party_id.name}</div>
        <div style={lineStyle}>{theDate}</div>
      </div>
    )
  }

  render() {
    let balance = (this.state.assetsList[0] || { balance: 0 }).balance;
    return (
      <div style={styles.div}>
        <div>Balance {Assets.commarize(balance)} ISK</div>
        <div style={styles.table}>
          <div style={styles.header} key='header'>
            <div style={styles.cell}>AMOUNT</div>
            <div style={styles.cell}>BALANCE</div>
            <div style={styles.cell}>DESCRIPTION</div>
            <div style={styles.cell}>TO WHO</div>
            <div style={styles.cell}>DATE</div>
          </div>
          {this.state.assetsList.map((line, idx) => {
            return Assets.assetsLine(idx, line)
          })}
        </div>
      </div>
    );
  }
}

Assets.propTypes = propTypes;
Assets.defaultProps = defaultProps;
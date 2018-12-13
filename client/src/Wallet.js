import React from 'react';
import PropTypes from 'prop-types';
import FetchData from './FetchData';
import TableStyles from './TableStyles';

const propTypes = {
  alt: PropTypes.string,
  walletList: PropTypes.array,
};

const defaultProps = {
};

const styles = TableStyles.styles;

export default class Wallet extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'wallet',
      walletList: [],
    };
  }

  static jsonToWalletList(json) {
    let list = [];
    if (json && json.info) {
      for (let we in json.info) {
        list.push(json.info[we]);
      }
    }
    return list;
  }

  componentDidMount() {
    new FetchData(
      { id: this.props.alt, scope: 'wallet' },
    ).get()
      .then(data => {
        let newList = Wallet.jsonToWalletList(data);
        if (newList.length !== (this.state.walletList || []).length) {
          this.setState({ walletList: newList })
        }
      });
  }

  static walletLine(key, { amount, balance, description, second_party_id, date }) {
    let lineStyle =
      (key % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    let newdate = new Date(date);
    let theDate = date === "DATE" ? date : newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();

    return (
      <div style={styles.row} key={key}>
        <div style={lineStyle}>{Math.round(amount).toLocaleString()}</div>
        <div style={lineStyle}>{Math.round(balance).toLocaleString()}</div>
        <div style={lineStyle}>{description}</div>
        <div style={lineStyle}>{second_party_id.name}</div>
        <div style={lineStyle}>{theDate}</div>
      </div>
    )
  }


  static commarize(num, min = 1e3) {
    // from https://gist.github.com/MartinMuzatko/1060fe584d17c7b9ca6e
    // Alter numbers larger than 1k
    if (!num) {
      return '0';
    }
    if (num >= min) {
      var units = ["k", "M", "B", "T"];
      var order = Math.floor(Math.log(num) / Math.log(1000));
      var unitname = units[order - 1];
      var out = Math.floor(num / Math.pow(1000, order));
      // output number remainder + unitname
      return out + unitname;
    }
    // return formatted original number
    return num.toLocaleString();
  }

  render() {
    let balance = (this.state.walletList[0] || { balance: 0 }).balance;
    return (
      <div style={styles.div}>
        <div>Balance {Wallet.commarize(Math.round(balance))} ISK</div>
        <div style={styles.table}>
          <div style={styles.header} key='header'>
            <div style={styles.cell}>AMOUNT</div>
            <div style={styles.cell}>BALANCE</div>
            <div style={styles.cell}>DESCRIPTION</div>
            <div style={styles.cell}>TO WHO</div>
            <div style={styles.cell}>DATE</div>
          </div>
          {this.state.walletList.map((line, idx) => {
            return Wallet.walletLine(idx, line)
          })}
        </div>
      </div>
    );
  }
}

Wallet.propTypes = propTypes;
Wallet.defaultProps = defaultProps;
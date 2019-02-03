import React from 'react';
import PropTypes from 'prop-types';
import FetchData from './common/FetchData';
import TableStyles from './TableStyles';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {
};

const styles = TableStyles.styles;

export default class Contracts extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'contract',
      contracts: {},
    };
  }

  componentDidMount() {
    new FetchData(
      { id: this.props.alt, scope: 'character', param1: 'market_contracts' },
    ).get()
      .then(data => {
        console.log('contract', data)
        this.setState({ contracts: data.info.contracts })
      });
  }

  contractLine(idx, contract) {
    try{
    console.log('contract', contract.title)
    let lineStyle =
      (idx % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    let newdate = new Date(contract.date_issued);
    let theDate = newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();

    let issuerCorp = this.state.people[contract.issuer_corporation_id.id];
    let availability = contract.availability.charAt(0).toUpperCase() + contract.availability.slice(1);
    return (
      <div style={styles.row} key={idx}>
        <div style={lineStyle}>
          {contract.issuer_name}<br/>
          {contract.issuer_corporation_ticker} / {contract.issuer_lliance}
        </div>
        <div style={lineStyle}>
          {contract.acceptor_name}<br/>
          {contract.acceptor_corporation_ticker} / {contract.acceptor_alliance}
          </div>
        <div style={lineStyle}>{availability}</div>
        <div style={lineStyle}>???</div>
        <div style={lineStyle}>{theDate}</div>
        <div style={lineStyle}>
          {contract.end_location_name}<br/>
        </div>
      </div>
    )}
    catch(e) {
      console.log(e);
      debugger;
      return (<span>Error reading contract</span>)
    }
  }

  render() {
    console.log('contracts', (this.state.ContractList ||{}).length)
    return (
      <div style={styles.div}>
        <div style={styles.table}>
          <div style={styles.header} key='header'>
            <div style={styles.cell}>FROM</div>
            <div style={styles.cell}>TO</div>
            <div style={styles.cell}>AVAILABILTY</div>
            <div style={styles.cell}>TYPE</div>
            <div style={styles.cell}>DATE</div>
            <div style={styles.cell}>LOCATION</div>
            <div style={styles.cell}>VALUE</div>
          </div>
          {Object.keys(this.state.contracts).map((key, idx) => {
            return this.contractLine(idx, this.state.contracts[key])
          })}
        </div>
      </div>
    );
  }
}

Contracts.propTypes = propTypes;
Contracts.defaultProps = defaultProps;
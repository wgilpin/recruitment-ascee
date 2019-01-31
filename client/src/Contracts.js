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
      people: {},
    };
  }

  componentDidMount() {
    new FetchData(
      { id: this.props.alt, scope: this.state.scope },
    ).get()
      .then(data => {
        console.log('contract', data)
        this.setState({ contracts: data.contracts, people: data.people })
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

    let acceptor = this.state.people[contract.acceptor_id.id];
    let acceptorCorp = acceptor.corporation_id.ticker;
    let acceptorAlliance = (acceptor.alliance_id || {}).ticker;
    let endLocation = {
      structureName: contract.end_location_id.StructureName,
      solarSystemID: contract.end_location_id.solarSystemID.solarSystemName,
      corpTicker: contract.end_location_id.corporation_id.ticker,
      allianceTicker: (contract.end_location_id.alliance_id || {}).ticker,
    };
    let issuerCorp = this.state.people[contract.issuer_corporation_id.id];
    let issuerTicker = issuerCorp.ticker;
    let issuerAlliance = (issuerCorp.alliance_id || {}).ticker;
    let availability = contract.availability.charAt(0).toUpperCase() + contract.availability.slice(1);
    return (
      <div style={styles.row} key={idx}>
        <div style={lineStyle}>
          {contract.issuer_id.name}<br/>
          {issuerTicker} / {issuerAlliance}
        </div>
        <div style={lineStyle}>
          {contract.acceptor_id.name}<br/>
          {acceptorCorp} / {acceptorAlliance}
          </div>
        <div style={lineStyle}>{availability}</div>
        <div style={lineStyle}>???</div>
        <div style={lineStyle}>{theDate}</div>
        <div style={lineStyle}>
          {endLocation.structureName}<br/>
          {endLocation.solarSystemID} / {endLocation.corpTicker} / {endLocation.allianceTicker}
        </div>
        <div style={lineStyle}>{theDate}</div>

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
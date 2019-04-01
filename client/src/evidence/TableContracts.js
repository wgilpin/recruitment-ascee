import PropTypes from 'prop-types';
import React from 'react';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

const styles = {
  cell: {
    display: 'table-cell',
    padding: '8px',
  },
  itemLine: {
    textAlign: 'left',
    display: 'table-row',
  },
  typeIcon: {
    width: '16px',
    height: '16px',
  },
  itemName: {
    paddingLeft: '8px',
  },
  table: {
    display: 'table',
    marginLeft: '20px',
  },
}

export default class TableContracts extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'market_contracts';
    this.addField(TableBase.kinds().text, 'type_name', 'Type');
    this.addField(TableBase.kinds().text, 'acceptor_name', 'Acceptor');
    this.addField(TableBase.kinds().text, 'availability');
    this.addField(TableBase.kinds().date,'date_issued', 'Issued');
    this.addField(TableBase.kinds().number, 'end_location_name', 'End Location');
    this.addField(TableBase.kinds().text,'for_corporation', 'For Corp');
    this.addField(TableBase.kinds().number,'issuer_corporation_name', 'Issuer Corp');
    this.addField(TableBase.kinds().number,'issuer_name','Issuer');
    this.addField(TableBase.kinds().ISK,'price');
    this.addField(TableBase.kinds().number,'start_location_name', 'Start Location');
    this.addField(TableBase.kinds().text,'status');
    this.setDetailer(
      '',
      this.formatEvent,
      'items',
      true);
  }

  build_item_line({ type_name, type_id, quantity }) {
    const imgSrc = `https://image.eveonline.com/Type/${type_id}_64.png`;
    return <div style={styles.itemLine}>
      <div style={styles.cell}>{quantity}</div>
      <div style={styles.cell}>
        <img style={styles.typeIcon} alt="icon" src={imgSrc} />
      </div>
      <div style={styles.cell}>
        <span style={styles.itemName}>{type_name}</span>
      </div>
    </div>
  }

  formatEvent(data, parent) {
    return <div style={styles.table}>
      {data.items.map(item => this.build_item_line(item))}
      </div>
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

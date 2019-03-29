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
    paddingBottom: '8px',
    paddingLeft: '8px',
  },
  itemLine: {
    textAlign: 'left',
    display: 'table-row',
  },
  typeIcon: {
    width: '20px',
    height: '20px',
  },
  itemName: {
  },
  table: {
    display: 'table',
    marginLeft: '20px',
  },
}

export default class TableFittings extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = 'ship_type';
    this.scope = 'fittings';
    this.addField(TableBase.kinds().text, 'name');
    this.addField(TableBase.kinds().text, 'description');
    this.addField(TableBase.kinds().text, 'ship_type_name');
    this.setDetailer(
      'fittings',
      this.formatEvent,
      'items',
      true);
  }

  build_item_line({type_name, quantity, type_id}) {
    const imgSrc = `https://image.eveonline.com/Type/${type_id}_64.png`;
    return <div style={styles.itemLine}>
      <div style={styles.cell}>{quantity}</div>
      <div style={styles.cell}>
        <img style={styles.typeIcon} alt={type_name} src={imgSrc} />
      </div>
      <div style={styles.cell}>
        <span style={styles.itemName}>{type_name}</span>
      </div>
    </div>
  }

  formatEvent(data, parent) {
    return <div style={styles.table} >
      {data.items.map(item => this.build_item_line(item))}
      </div>
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
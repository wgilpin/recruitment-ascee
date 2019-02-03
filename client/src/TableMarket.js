import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableMarket extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = 'issued';
    this.scope = 'market_contracts';
    this.addDateField('issued', 'Date');
    this.addTextField('type');
    this.addISKField('price');
    this.addNumberField('volume_total', 'Volume');
    this.addTextField('location');
    this.addTextField('region');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
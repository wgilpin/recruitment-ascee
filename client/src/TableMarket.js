import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableMarket extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'market';
    this.addTextField('type');
    this.addNumberField('volume');
    this.addNumberField('volume_remain');
    this.addTextField('system');
    this.addTextField('region');
    this.addTextField('labels');
    this.addTextField('is_buy_order');
    this.addISKField('price');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
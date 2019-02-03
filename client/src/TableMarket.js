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
    this.scope = 'market';
    this.addField(TableBase.kinds().date,'issued', 'Date');
    this.addField(TableBase.kinds().text,'type');
    this.addField(TableBase.kinds().ISK,'price');
    this.addField(TableBase.kinds().number,'volume_total', 'Volume');
    this.addField(TableBase.kinds().text,'location');
    this.addField(TableBase.kinds().text,'region');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
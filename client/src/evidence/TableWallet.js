import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableWallet extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'date';
    this.scope = 'wallet';
    this.addField(TableBase.kinds().date,'date');
    this.addField(TableBase.kinds().ISK,'amount');
    this.addField(TableBase.kinds().ISK,'balance');
    this.addField(TableBase.kinds().text,'other_party');
    this.addField(TableBase.kinds().text,'description');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
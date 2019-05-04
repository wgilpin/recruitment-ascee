import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableBlueprints extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = 'name';
    this.scope = 'assets/blueprints';
    this.addField(TableBase.kinds().date, 'type');
    this.addField(TableBase.kinds().number, 'quantity');
    this.addField(TableBase.kinds().text, 'system');
    this.addField(TableBase.kinds().number, 'ore');
    this.addField(TableBase.kinds().number, 'value');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

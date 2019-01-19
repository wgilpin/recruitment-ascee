import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableContracts extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'contract';
    this.addNumberField('acceptor');
    this.addTextField('assignee');
    this.addTextField('availability');
    this.addDateField('date_issued');
    this.addNumberField('end_location');
    this.addTextField('for_corporation');
    this.addNumberField('issuer_corporation');
    this.addNumberField('issuer');
    this.addTextField('price');
    this.addNumberField('start_location');
    this.addTextField('status');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

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
    this.addField(TableBase.kinds().text, 'assignee');
    this.addField(TableBase.kinds().text, 'availability');
    this.addField(TableBase.kinds().date,'date_issued');
    this.addField(TableBase.kinds().number, 'end_location');
    this.addField(TableBase.kinds().text,'for_corporation');
    this.addField(TableBase.kinds().number,'issuer_corporation');
    this.addField(TableBase.kinds().number,'issuer');
    this.addField(TableBase.kinds().ISK,'price');
    this.addField(TableBase.kinds().number,'start_location');
    this.addField(TableBase.kinds().text,'status');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

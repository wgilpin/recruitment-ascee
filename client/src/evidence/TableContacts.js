import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableContacts extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'contacts';
    this.addField(TableBase.kinds().text,'name');
    this.addField(TableBase.kinds().text,'corp');
    this.addField(TableBase.kinds().text,'alliance');
    this.addField(TableBase.kinds().standing,'standing');
    this.addField(TableBase.kinds().text,'labels');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
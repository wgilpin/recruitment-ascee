import PropTypes from 'prop-types';
import TableStyles from './TableStyles';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableContacts extends TableBase {
  constructor(props) {
    super(props);
    this.scope = 'contacts';
    this.addTextField('name');
    this.addTextField('corp');
    this.addTextField('alliance');
    // this.addTextField('type');
    this.addNumberField('standing');
    this.addTextField('labels');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
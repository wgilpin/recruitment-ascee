import PropTypes from 'prop-types';
import TableStyles from './TableStyles';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableBookmarks extends TableBase {
  constructor(props) {
    super(props);
    this.scope = 'abstract';
    this.addTextField('name');
    this.addTextField('location');
    this.addNumberField('note');
    this.addGroupBy(['region', 'location'])
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
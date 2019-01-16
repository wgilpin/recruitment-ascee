import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableBookmarks extends TableBase {
  constructor(props) {
    super(props);
    this.scope = 'bookmarks';
    this.groupSortField = 'label';
    this.addTextField('folder');
    this.addTextField('system');
    this.addTextField('label');
    this.addTextField('note');
    this.addGroupBy(['folder', 'system'])
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
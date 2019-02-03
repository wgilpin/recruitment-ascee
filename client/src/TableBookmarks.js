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
    this.addField(TableBase.kinds().text, 'folder');
    this.addField(TableBase.kinds().text, 'system');
    this.addField(TableBase.kinds().text, 'label');
    this.addField(TableBase.kinds().text,'note');
    this.addGroupBy(['folder', 'system'])
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
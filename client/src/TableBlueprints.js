import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableBlueprints extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'assets/blueprints';
    this.addField(TableBase.kinds().text,'type');
    this.addField(TableBase.kinds().bool, 'is_blueprint_copy', 'BPC');
    this.addField(TableBase.kinds().standing, 'location');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
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
    this.scope = 'blueprints';
    this.addTextField('type');
    this.addBoolField('is_blueprint_copy', 'BPC');
    this.addStandingField('location');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
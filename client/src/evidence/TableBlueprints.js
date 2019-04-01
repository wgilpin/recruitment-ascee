import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableBlueprints extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'type_name';
    this.scope = 'blueprints';
    this.addField(TableBase.kinds().text,'type_name', 'Type');
    this.addField(TableBase.kinds().standing, 'system_name', 'System');
    this.addField(TableBase.kinds().standing, 'location_name', 'Location');
    this.addField(TableBase.kinds().bool, 'is_blueprint_copy', 'BPC');
    this.addField(TableBase.kinds().bool, 'quantity',);
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
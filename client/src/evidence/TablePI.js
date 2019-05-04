import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TablePI extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = 'name';
    this.groupBy = ['region'];
    this.scope = 'planetary_interaction';
    this.addField(TableBase.kinds().date, 'last_update');
    this.addField(TableBase.kinds().number, 'num_pins', '# Pins');
    this.addField(TableBase.kinds().text, 'planet_type');
    this.addField(TableBase.kinds().text, 'solar_system_name');
    this.addField(TableBase.kinds().text, 'region_name');
    this.addField(TableBase.kinds().number, 'region_id');
    this.addField(TableBase.kinds().number, 'solar_system_id');
    this.addField(TableBase.kinds().number, 'upgrade_level');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

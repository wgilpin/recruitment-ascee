import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableIndustry extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'industry';
    this.addField(TableBase.kinds().text, 'blueprint_type_name', 'Type');
    this.addField(TableBase.kinds().number, 'cost');
    this.addField(TableBase.kinds().number, 'duration');
    this.addField(TableBase.kinds().date,'end_date');
    this.addField(TableBase.kinds().number, 'licensed_runs');
    this.addField(TableBase.kinds().text, 'output_location_name');
    this.addField(TableBase.kinds().number, 'runs');
    this.addField(TableBase.kinds().date, 'start_date');
    this.addField(TableBase.kinds().text, 'station_name');
    this.addField(TableBase.kinds().text, 'status');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
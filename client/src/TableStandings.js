import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableStandings extends TableBase {
  constructor(props) {
    super(props);
    this.state.sortBy = 'name';
    this.scope = 'standings';
    this.addTextField('name');
    this.addTextField('corp');
    this.addTextField('alliance');
    this.addStandingField('standing');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;
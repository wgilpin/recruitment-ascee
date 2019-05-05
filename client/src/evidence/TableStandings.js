import PropTypes from 'prop-types';
import TableBase from './TableBase';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

export default class TableStandings extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = 'name';
    this.scope = 'standings';
    this.addField(TableBase.kinds().text, 'name');
    this.addField(TableBase.kinds().text, 'corp');
    this.addField(TableBase.kinds().text, 'alliance');
    this.addField(TableBase.kinds().standing, 'standing');
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

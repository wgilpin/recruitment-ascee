import React from 'react';
import PropTypes from 'prop-types';
import TableBase from './TableBase';
import Misc from '../common/Misc';
import RadioGroup from './RadioGroup';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

const styles = {
  select: {
    padding: '8px',
    margin: '8px',
    width: '300px',
    backgroundColor: '#111',
    color: 'white',
    height: '24px',
    borderWidth: '1px',
    borderColor: 'grey',
  },
  header: {
    fontWeight: 500,
    fontSize: 'large',
    paddingBottom: '6px',
  },
};

export default class TableWallet extends TableBase {
  constructor(props) {
    super(props);
    this.sortBy = 'date';
    this.scope = 'transactions';
    this.addField(TableBase.kinds().date, 'date');
    this.addField(TableBase.kinds().number, 'quantity', '#');
    this.addField(TableBase.kinds().ISK, 'unit_price');
    this.addField(TableBase.kinds().ISK, 'total_value', 'Total');
    this.addField(TableBase.kinds().text, 'type_name', 'Item');
    this.addField(TableBase.kinds().text, 'client_name', 'Other Party');
    this.addField(TableBase.kinds().text, 'location_name', 'Location');
  }

  handleSelect = division => {
    this.setState({ division: division.target.value }, () =>
      this.processData(this.preProcessData(this.state.rawData))
    );
  };

  applySigns (items) {
    // return then list, but all Buy Orders (is_buy===True) are set to negative
    return items.map(item => ({
      ...item,
      total_value: (item.is_buy ? -1 : 1) * item.total_value,
    }));
  }

  preProcessData(data) {
    // filter by division if one is selected.
    const signedData = { info: this.applySigns(data.info) };
    if (this.state.rawData.length && this.state.rawData[0].division_name) {
      if (!this.state.division) {
        console.log('no state div');
        console.log('set division', this.state.rawData[0].division_name);
        this.setState({ division: this.state.rawData[0].division_name });
        return this.state.rawData[0];
      }
      const the_div = signedData.filter(
        div => div.division_name === this.state.division
      )[0];
      if (the_div) {
        console.log('return the_div');
        return the_div;
      }
    }
    console.log('no divisions, return data');
    return signedData;
  }

  handleFilter = filterId => {
    // filter by radio button selection
    //  0 - show all
    //  1 - show only |x| > 1 billion 
    const newData = this.state.rawData.filter(
      it => filterId === 0 || Math.abs(it.total_value) > 1000000000
    );
    this.setState({ data: this.applySigns(newData) });
  };

  showHeader(data) {
    if (data && data.length && data[0].division_name) {
      return (
        <div>
          <select style={styles.select} onChange={this.handleSelect}>
            {data.map(division => (
              <option value={division.division_name}>
                {division.division_name}
              </option>
            ))}
          </select>
          {data && data.length && (
            <div style={styles.header}>
              Balance {Misc.commarize(data[0].balance)} ISK
            </div>
          )}
        </div>
      );
    } else {
      if (data && data.length) {
        if (data && data.length) {
          return [
            <RadioGroup
              items={['Show All', '  > 1B ISK  ']}
              onChange={this.handleFilter}
            />,
            <div style={styles.header}>
              Balance {Misc.commarize(data[0].balance)} ISK
            </div>,
          ];
        }
        return null;
      }
      return null;
    }
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

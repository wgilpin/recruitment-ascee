import React from 'reactn';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from './FetchData';
import TableStyles from './TableStyles';

const propTypes = {
  alt: PropTypes.string,
};

const defaultProps = {};

const styles = TableStyles.styles;

export default class TableBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
    };
    this.scope = 'abstract';
    this.fields = [];
    this.groupBy = null;
  }

  kinds() {
    return {
      text: 'text',
      date: 'date',
      ISK: 'ISK',
      number: 'number',
    };
  }

  addGroupBy(groups) {
    this.groupBy = groups;
  }

  addTextField(id, header) {
    this.fields.push({ id, kind: this.kinds().text, header });
  }

  addNumberField(id, header) {
    this.fields.push({ id, kind: this.kinds().number, header });
  }

  addISKField(id, header) {
    this.fields.push({ id, kind: this.kinds().ISK, header });
  }

  addDateField(id, header) {
    this.fields.push({ id, kind: this.kinds().date, header });
  }

  static jsonToList(json) {
    let list = [];
    if (json && json.info) {
      for (let we in json.info) {
        list.push(json.info[we]);
      }
    }
    return list;
  }

  componentDidMount() {
    new FetchData({ id: this.props.alt, scope: this.scope })
      .get()
      .then(data => {
        let newList = TableBase.jsonToList(data);
        if (newList.length !== (this.state.data || []).length) {
          this.setState({ data: newList, loading: false });
        }
      });
  }

  makeDateField(date, field) {
    const newdate = new Date(date);
    const theDate =
      newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();
    return <div style={styles.cell}>{theDate}</div>;
  }

  makeTextField(text, field) {
    return <div style={styles.cell}>{text}</div>;
  }

  makeISKField(value, field) {
    return <div style={styles.cell}>{Math.round(value).toLocaleString()}</div>;
  }

  makeNumberField(value, field) {
    return <div style={styles.cell}>{value}</div>;
  }

  makeField(field, value) {
    switch (field.kind) {
      case this.kinds().date: {
        return this.makeDateField(value, field);
      }
      case this.kinds().number: {
        return this.makeNumberField(value, field);
      }
      case this.kinds().ISK: {
        return this.makeISKField(value, field);
      }
      default: {
        return this.makeTextField(value, field);
      }
    }
  }

  makeLine(values, idx) {
    const lineStyle = { ...styles.row, ...(idx % 2 === 0 ? styles.isOdd : {}) };

    return (
      <div style={lineStyle} key={idx}>
        {this.fields.map((field, i) => this.makeField(field, values[field.id]))}
      </div>
    );
  }

  makeSection(lines, heading, collapsible) {
    return lines.map((line, idx) => {
      return this.makeLine(line, idx);
    });
  }

  titleise(text) {
    return text[0].toUpperCase() + text.slice(1);
  }

  makeHeader() {
    return (
      <div style={styles.header} key="header">
        {this.fields.map(field => (
          <div style={styles.cell}>{this.titleise(field.header || field.id)}</div>
        ))}
      </div>
    );
  }

  makeGroupLines(tree) {
    if (tree.level) {
      // not the root node
      return Object.keys(tree).map((key) => {
        if (key === 'level') {
          return null;
        }
        return this.makeGroupLines(tree[key]);
      })
    }
    // root
    return this.makeSection(tree);
  }

  makeGroups() {
    // covert a list of items into their groupings, based on fields in this.groupBy
    const grouped = {};
    this.state.data.forEach(item => {
      let node = grouped;
      for (let i = 0; i < this.groupBy.length; i++) {
        const level = item[this.groupBy[i]];
        node[level] = node[level] || {};
        if (i === this.groupBy.length - 1) {
          // last level, add the item
          node[level][item.id] = { ...item };
        }
        node = node[level];
      }
    });

    return this.makeGroupLines(grouped);
  }

  render() {
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    return (
      <div style={styles.div}>
        <div style={styles.table}>
          {this.makeHeader()}
          {this.groupBy === null
            ? this.makeSection(this.state.data)
            : this.makeGroups()}
        </div>
      </div>
    );
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

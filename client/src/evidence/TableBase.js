import React from 'reactn';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from '../common/FetchData';
import TableStyles from './TableStyles';
import collapsedImg from '../images/collapsed.png';
import expandedImg from '../images/expanded.png';
import moment from 'moment';

const propTypes = {
  alt: PropTypes.string,
};

const INDENT = 15;

const defaultProps = {};

const styles = {
  ...TableStyles.styles,
  sortHeader: {
    cursor: 'pointer',
  },
  standing: {
    neutral: {
      color: 'yellow',
    },
    poor: {
      color: 'red',
    },
  },
  groupRow: {
    paddingTop: '12px',
    paddingBottom: '12px',
    textAlign: 'left',
    color: TableStyles.styles.themeColor.color,
    fontWeight: 600,
  },
  ISKnegative: {
    color: 'red',
  },
  ISKpositive: {
    color: 'lightblue',
  },
};

export default class TableBase extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      loading: true,
      groups: null,
    };
    this.scope = 'abstract';
    this.fields = [];
    this.groupBy = [];
    this.detailScope = null;
    this.detailFormatter = null;
    this.keyField = null;
    this.listName = null;
    const locale = window.navigator.userLanguage || window.navigator.language;
    moment.locale(locale);
  }

  static kinds() {
    return {
      text: 'text',
      date: 'date',
      ISK: 'ISK',
      number: 'number',
      standing: 'standing',
      bool: 'YN',
    };
  }

  addGroupBy(groups) {
    this.groupBy = groups;
  }

  addField(kind, id, header, displayValues) {
    this.fields.push({
      id,
      kind,
      header: header || this.titleise(id),
      displayValues,
    });
  }

  setDetailer(scope, formatter, keyField, canSkipFetch) {
    this.detailScope = scope;
    this.detailFormatter = formatter;
    this.keyField = keyField;
    this.needsFetch = !canSkipFetch;
  }

  jsonToList(json) {
    if (json && json.info) {
      const sourceList = this.listName ? json.info[this.listName] : json.info;
      const list = Object.values(sourceList);
      return list;
    }
    return [];
  }

  componentDidMount() {
    new FetchData({
      id: this.props.targetId,
      scope: this.props.corporation ? 'corporation' : 'character',
      param1: this.scope,
    })
      .get()
      .then(data => {
        if (data && data.error) {
          return this.setState({ ...data.error, loading: false });
        }
        this.setState({ rawData: data.info });
        if (this.preProcessData) {
          data = this.preProcessData(data);
        }
        this.processData(data);
      });
  }

  processData(data) {
    let newList = this.jsonToList(data);
    this.setState({ data: newList, loading: false }, () => {
      // after state set
      if (!!this.sortBy) {
        const found = this.fields.filter(
          f => f.id === this.sortBy || f.id === this.sortBy.substring(1)
        );
        if (found.length > 0) {
          this.sortColumn(found[0]);
        }
      }
      if (this.groupBy.length > 0) {
        this.buildGroups();
      }
    });
  }

  async fetchDetails(forId) {
    if (!this.detailScope || !this.detailFormatter) {
      console.error('fetchDetails: Either Scope or Formatter missing');
      return null;
    }
    const fetchParams = {
      id: this.props.targetId,
      scope: 'character',
      param1: this.detailScope,
      param2: forId,
    };
    return new FetchData(fetchParams).get().then(data => {
      return this.detailFormatter(
        data.info,
        this.state.data.find(it => it[this.keyField] === forId)
      );
    });
  }

  makeDateField(date, field, final) {
    let style = { ...styles.cell, whiteSpace: 'nowrap' };
    if (final) {
      style = { ...style, width: '100%' };
    }
    const theDate = moment(date).format('DD-MMM-YYYY HH:MM');
    return <div style={style}>{theDate}</div>;
  }

  makeTextField(text, field, final, idx) {
    let style = { paddingLeft: INDENT, ...styles.cell, whiteSpace: 'nowrap' };
    if (final) {
      style.width = '99%';
    }
    // TODO: This shouldn't need a try..catch but the API needs updating
    try {
      if ((this.state.data[idx].redlisted || []).indexOf(field.id) > -1) {
        style.color = 'red';
        style.fontWeight = '600';
      }
    } catch (e) {
      if (e instanceof TypeError) {
        console.error('API - redlisted');
      } else {
        throw e;
      }
    }
    if (!text) {
      return <div style={style}>&ensp;</div>;
    }
    return <div style={style}>{text}</div>;
  }

  makeBoolField(value, field, final) {
    let style = { paddingLeft: INDENT, ...styles.cell, whiteSpace: 'nowrap' };
    const displayValues = field.displayValues || ['Y', 'N'];
    if (final) {
      style = { ...style, width: '99%' };
    }
    if (!value) {
      return <div style={style}>{displayValues[1]}</div>;
    }
    return (
      <div style={style}>{!!value ? displayValues[0] : displayValues[1]}</div>
    );
  }

  makeISKField(value, field, final) {
    let style = { ...styles.cell, textAlign: 'right' };
    if (final) {
      style = { ...style, width: '100%' };
    }
    if (value < 0) {
      style = { ...style, ...styles.ISKnegative };
    } else {
      style = { ...style, ...styles.ISKpositive };
    }
    return <div style={style}>{Math.round(value).toLocaleString()}</div>;
  }

  makeNumberField(value, field, final) {
    let style = { ...styles.cell };
    if (final) {
      style = { ...style, width: '100%' };
    }
    return <div style={style}>{value}</div>;
  }

  makeStandingField(value, field, final) {
    let style = { ...styles.cell };
    if (value === 0) {
      style = { ...style, ...styles.standing.neutral };
    } else if (value < 0) {
      style = { ...style, ...styles.standing.poor };
    }
    if (final) {
      style = { ...style, width: '100%' };
    }
    return <div style={style}>{value}</div>;
  }

  makeField(field, value, final, idx) {
    // ignore fields in grouping -= they are headers
    // if (this.groupBy.slice(0, this.groupBy.length-1).indexOf(field.id) > -1){
    if (this.groupBy.indexOf(field.id) > -1) {
      return this.makeTextField(null, field, final, idx);
    }
    switch (field.kind) {
      case TableBase.kinds().date: {
        return this.makeDateField(value, field, final, idx);
      }
      case TableBase.kinds().bool: {
        return this.makeBoolField(value, field, final);
      }
      case TableBase.kinds().number: {
        return this.makeNumberField(value, field, final);
      }
      case TableBase.kinds().ISK: {
        return this.makeISKField(value, field, final);
      }
      case TableBase.kinds().standing: {
        return this.makeStandingField(value, field, final);
      }
      default: {
        return this.makeTextField(value, field, final, idx);
      }
    }
  }

  async handleClickLine(values) {
    // TODO: Toggle details visibility
    let key = values[this.keyField];
    const copyData = this.state.data.slice(0);
    const idx = copyData.findIndex(el => el[this.keyField] === key);
    if (this.needsFetch) {
      // lookup details on server
      let key2 = this.keyField2 ? values[this.keyField2] : null;
      const details = await this.fetchDetails(key, key2);
      copyData[idx].details = details;
    } else {
      copyData[idx].details = this.detailFormatter(copyData[idx]);
    }
    copyData[idx].open = !copyData[idx].open;
    this.setState({ data: copyData });
  }

  makeLine(values, idx, depth) {
    depth = `${INDENT * (depth || 0)}px`;
    const lineStyle = {
      ...(idx % 2 === 0 ? styles.isOdd : {}),
      marginLeft: depth,
      ...styles.row,
    };
    return [
      <div
        style={lineStyle}
        key={idx}
        onClick={() => this.handleClickLine(values)}
      >
        {this.fields.map((field, i) =>
          this.makeField(
            field,
            values[field.id],
            i === this.fields.length - 1,
            idx
          )
        )}
      </div>,
      values.open && (
        <div style={{ display: 'table-cell', width: '100%' }}>
          {values.details}
        </div>
      ),
    ];
  }

  makeSection(lines, heading, collapsible, depth) {
    const depthPx = `${INDENT * (depth || 0)}px`;
    return (
      <React.Fragment>
        {heading && (
          <div style={{ ...styles.groupRow, marginLeft: depthPx }}>
            &ensp;{heading}
          </div>
        )}
        {lines.map((line, idx) => {
          if (line === 'leaf') {
            return null;
          }
          return this.makeLine(line, idx, depth + 1);
        })}
      </React.Fragment>
    );
  }

  titleise(text) {
    let words = text.split('_');
    if (words.length > 1 && words[words.length - 1] === 'name') {
      words = words.splice(0, words.length - 1);
    }
    text = words.join(' ');
    return (text[0].toUpperCase() + text.slice(1)).replace(/_/g, ' ');
  }

  sortFn(property, fieldKind) {
    const defaultVal = fieldKind === 'standing' ? 0 : 'zzzz';
    let sortOrder = 1;
    if (property[0] === '-') {
      sortOrder = -1;
      property = property.substr(1);
    }
    if (fieldKind === 'YN') {
      return (a, b) =>
        a[property] === b[property] ? 0 : a[property] ? -sortOrder : sortOrder;
    }
    return (a, b) => {
      const aPrime = a.hasOwnProperty(property) ? a[property] : defaultVal;
      const bPrime = b.hasOwnProperty(property) ? b[property] : defaultVal;
      let result = aPrime < bPrime ? -1 : (aPrime > bPrime ? 1 : 0);
      return result * sortOrder;
    };
  }

  sortColumn(field) {
    // sort
    if (!!this.groupBy.length) {
      // can't sort if grouped
      return;
    }
    if (this.sortBy === field.id) {
      this.sortBy = `-${field.id}`;
    } else {
      this.sortBy = field.id;
    }
    let sortFn = this.sortFn(this.sortBy, field.kind);
    const resorted = this.state.data.sort(sortFn);
    this.setState({ data: resorted });
  }

  toggleGroup(folderName) {
    let current = this.state.groups[folderName].collapsed;
    this.setState({
      groups: {
        ...this.state.groups,
        [folderName]: {
          ...this.state.groups[folderName],
          collapsed: !current,
        },
      },
    });
  }

  makeFolderLine(name) {
    const group = this.state.groups[name];
    return (
      <div
        style={styles.folderHeader}
        key={name}
        onClick={() => this.toggleGroup(name)}
      >
        {!group.collapsed && <img src={expandedImg} alt="+" />}
        {group.collapsed && <img src={collapsedImg} alt="-" />}
        {' ' + name.toUpperCase()}
      </div>
    );
  }

  makeHeader() {
    return (
      <div style={styles.header} key="header">
        {this.fields.map(field =>
          // ignore fields in grouping -= they are headers
          this.groupBy.slice(0, this.groupBy.length - 1).indexOf(field.id) >
          -1 ? null : (
            <div
              style={{
                ...styles.cell,
                ...styles.sortHeader,
                ...(field.kind === 'ISK' && { textAlign: 'right' }),
              }}
              onClick={() => this.sortColumn(field)}
            >
              {field.header}
            </div>
          )
        )}
      </div>
    );
  }

  makeGroupLines(key, tree, depth) {
    if (!tree) {
      return null;
    }
    if (tree.level === 'leaf') {
      let lines = Object.keys(tree).map(key => tree[key]);
      if (!!this.groupSortField) {
        lines = lines.sort();
      }
      return this.makeSection(lines, key, true, depth);
    }
    // not a leaf node
    return (
      <React.Fragment>
        {tree.level !== 'root' && this.makeFolderLine(tree.level)}
        {!tree.collapsed && (
          <div>
            {Object.keys(tree)
              .sort()
              .map(key => {
                if (key === 'level' || key === 'collapsed') {
                  return null;
                }
                return this.makeGroupLines(key, tree[key], depth + 1);
              })}
          </div>
        )}
      </React.Fragment>
    );
  }

  buildGroups() {
    // convert a list of items into their groupings, based on fields in this.groupBy
    const grouped = { level: 'root' };
    this.state.data.forEach(item => {
      let node = grouped;
      for (let i = 0; i < this.groupBy.length; i++) {
        const level = item[this.groupBy[i]] || 'Other';
        node[level] = node[level] || {};
        node[level].level = level;
        if (i === this.groupBy.length - 1) {
          // last level, add the item
          node[level][item.id] = { ...item };
          node[level].level = 'leaf';
        }
        node = node[level];
      }
    });
    // top level collapsible
    Object.keys(grouped).forEach(key => {
      if (key !== 'level') {
        grouped[key].collapsed = false;
      }
    });
    this.setState({ groups: grouped });
  }

  render() {
    if (this.state.error) {
      return (
        <div>
          {this.state.error}
          <br />
          Error {this.state.status}
        </div>
      );
    }
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    const { data, rawData } = this.state;
    if (data.length === 0) {
      return [
        this.showHeader ? this.showHeader(rawData) : null,
        <div>None found</div>,
      ];
    }
    return [
      this.showHeader ? this.showHeader(rawData) : null,
      <div style={styles.div}>
        <div style={styles.table}>
          {!this.groupBy.length ? (
            <React.Fragment>
              {this.makeHeader()}
              {this.makeSection(data)}
            </React.Fragment>
          ) : (
            this.makeGroupLines(null, this.state.groups, 0)
          )}
        </div>
      </div>,
    ];
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

import React from 'reactn';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from './common/FetchData';
import TableStyles from './TableStyles';
import collapsedImg from './images/collapsed.png';
import expandedImg from './images/expanded.png';

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
  }
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

  addField(kind, id, header) {
    this.fields.push({
      id,
      kind,
      header: header || this.titleise(id),
    });
  }

  setDetailer(scope, formatter, keyField) {
    this.detailScope = scope;
    this.detailFormatter = formatter;
    this.keyField = keyField;
  }

  jsonToList(json) {
    let list = [];
    if (json && json.info) {
      for (let we in json.info) {
        list.push(json.info[we]);
      }
    }
    return list;
  }

  componentDidMount() {
    new FetchData({ id: this.props.alt, scope: 'character', param1: this.scope })
      .get()
      .then(data => {
        if (data && data.error) {
          return this.setState({ ...data.error, loading: false });
        }
        let newList = this.jsonToList(data);
        this.setState({ data: newList, loading: false });
        if (newList.length !== (this.state.data || []).length) {
          // after state set
          if (!!this.sortBy) {
            const found = this.fields.filter(f => f.id === this.sortBy);
            if (found.length > 0) {
              this.sortColumn(found[0]);
            }
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
    const fetchParams ={
      id: this.props.alt,
      scope: 'character',
      param1: this.detailScope,
      param2: forId
    }
    return new FetchData(fetchParams)
      .get()
      .then(data => {
        return this.detailFormatter(
          data.info,
          this.state.data.find(it => it[this.keyField] === forId),
        );
      });
  }

  makeDateField(date, field, final) {
    let style = { ...styles.cell, whiteSpace: 'nowrap' };
    if (final) {
      style = { ...style, width: '100%'};
    }
    const newdate = new Date(date);
    const theDate =
      newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();
    return <div style={style}>{theDate}</div>;
  }

  makeTextField(text, field, final) {
    let style = { paddingLeft: INDENT, ...styles.cell, whiteSpace: 'nowrap' };
    if (final) {
      style = { ...style, width: '99%' };
    }
    if (!text) {
      return <div style={style}>&ensp;</div>;
    }
    return <div style={style}>{text}</div>;
  }

  makeBoolField(value, field, final) {
    let style = { paddingLeft: INDENT, ...styles.cell, whiteSpace: 'nowrap' };
    if (final) {
      style = { ...style, width: '99%' };
    }
    if (!value) {
      return <div style={style}>N</div>;
    }
    return <div style={style}>{!!value ? 'Y' : 'N'}</div>;
  }

  makeISKField(value, field, final) {
    let style = { ...styles.cell };
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

  makeField(field, value, final) {
    // ignore fields in grouping -= they are headers
    // if (this.groupBy.slice(0, this.groupBy.length-1).indexOf(field.id) > -1){
    if (this.groupBy.indexOf(field.id) > -1) {
      return this.makeTextField(null, field, final);
    }
    switch (field.kind) {
      case TableBase.kinds().date: {
        return this.makeDateField(value, field, final);
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
        return this.makeTextField(value, field, final);
      }
    }
  }

  async handleClickLine(values) {
    console.log(values);
    // TODO: HELP. Toggle details visibility
    let key = values[this.keyField];
    let key2 = this.keyField2 ? values[this.keyField2] : null;

    console.log(key);
    const details = await this.fetchDetails(key, key2);
    const copyData = this.state.data.slice(0);
    console.log(copyData);
    const idx = copyData.findIndex(el => el[this.keyField] === key);
    console.log(idx);

    copyData[idx].details = details;
    console.log(copyData);

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
          this.makeField(field, values[field.id], i === this.fields.length - 1),
        )}
      </div>,
      values.details && <div style={{display: 'table-cell', width: '100%'}}>{values.details}</div>,
    ];
  }

  makeSection(lines, heading, collapsible, depth) {
    const depthPx = `${INDENT * (depth || 0)}px`;
    return (
      < >
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
      </>
    );
  }

  titleise(text) {
    return (text[0].toUpperCase() + text.slice(1)).replace(/_/g, ' ');
  }

  sortFn(property, numeric) {
    const defaultVal = numeric ? 0 : 'zzzz';
    var sortOrder = 1;
    if(property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }
    const fn = (a,b) => {
        var result = ((a[property] || defaultVal) < (b[property] || defaultVal))
          ? -1
          : ((a[property] || defaultVal) > (b[property] || defaultVal))
            ? 1
            : 0;
        return result * sortOrder;
    }
    return fn.bind(defaultVal);
  }

  sortColumn(field) {
    // sort
    if (!!this.groupBy.length) {
      // can't sort if grouped
      return;
    }
    const isCurrentFieldIdx = (this.sortBy || '').indexOf(field.id);
    this.sortBy = isCurrentFieldIdx === -1 ? field.id : (
      isCurrentFieldIdx === 0
        ? `-${field.id}`
        : field.id
    )
    let sortFn = this.sortFn(this.sortBy, field.kind === 'standing');
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
              style={{ ...styles.cell, ...styles.sortHeader }}
              onClick={() => this.sortColumn(field)}
            >
              {field.header}
            </div>
          ),
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
      < >
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
      </>
    );
  }

  buildGroups() {
    // covert a list of items into their groupings, based on fields in this.groupBy
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
      return <div>
          {this.state.error}
          <br/>
          Error {this.state.status}
        </div>
    }
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    if (this.state.data.length === 0) {
      return <div>None found</div>
    }
    return (
      <div style={styles.div}>
        <div style={styles.table}>
          {}
          {!this.groupBy.length ? (
            < >
              {this.makeHeader()}
              {this.makeSection(this.state.data)}
            </>
          ) : (
            this.makeGroupLines(null, this.state.groups, 0)
          )}
        </div>
      </div>
    );
  }
}

TableBase.propTypes = propTypes;
TableBase.defaultProps = defaultProps;

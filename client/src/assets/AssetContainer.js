import React from 'reactn';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';
import AssetItem from './AssetItem';
import Misc from '../common/Misc';
import collapsedImg from '../images/collapsed.png';
import expandedImg from '../images/expanded.png';

const propTypes = {
  assets: PropTypes.object,
  onClickHeader: PropTypes.func,
  index: PropTypes.number,
  depth: PropTypes.number,
};

const defaultProps = {
  assets: {},
  onClickHeader: null,
  index: 0,
  depth: 0,
};

const styles = {
  ...TableStyles.styles,
  structure: {
    width: '100%',
  },
  red: {
    color: 'red',
    fontWeight: 500,
  },
};

const isEmpty = obj => {
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
};

export default class AssetContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = { collapsed: true };
  }

  getItemLine(item, index) {
    const depthPadding = 40 * this.props.depth + 20;
    let lineStyle = this.props.index % 2 === 0 ? styles.isOdd : {};
    lineStyle = {
      ...lineStyle,
      ...styles.cell,
      ...styles.row,
      paddingLeft: depthPadding,
    };
    return (
      <div style={lineStyle} key={item.item_id}>
        <div>
          {item.name}&emsp;
          <span style={styles.isk}>
            ({Misc.commarize(this.props.asset.price)} ISK)
          </span>
        </div>
      </div>
    );
  }

  listOfItemLines(items) {
    const orphans = [];

    const containers = Object.keys(items).map(it => {
      // TODO: check for empty object
      if (!isEmpty(items[it].items)) {
        console.log('step into AC', items[it]);
        return (
          <AssetContainer asset={items[it]} depth={this.props.depth + 1} />
        );
      } else {
        orphans.push(it);
        return null;
      }
    });
    const sortedOrphans = orphans.sort(
      (a, b) => items[b].price - items[a].price
    );
    const orphanItems = sortedOrphans.map((it, idx) => (
      <AssetItem asset={items[it]} depth={this.props.depth + 1} index={idx} />
    ));
    return containers.concat(orphanItems);
  }

  handleClick = e => {
    this.setState({ collapsed: !this.state.collapsed });
    e.preventDefault();
  };

  expansionButton = () => {
    return [
      !this.state.collapsed && <img src={expandedImg} alt="+" />,
      this.state.collapsed && <img src={collapsedImg} alt="-" />,
    ];
  };

  render() {
    let {
      item_id,
      name,
      asset: { items, value, type },
    } = this.props;
    name = name || this.props.asset.name;
    const depthPadding = 40 * this.props.depth;
    const iskText = `${Misc.commarize(value)} ISK`;
    let lineStyle = {
      ...styles.nonTableCell,
      paddingLeft: depthPadding,
      ...styles.structure,
    };
    if ((this.props.asset.redlisted || []).length > 0) {
      lineStyle = { ...lineStyle, ...styles.red };
    }
    // orphans is a list of keys of items which are not containers
    return (
      <div>
        <div style={lineStyle} key={item_id || name} onClick={this.handleClick}>
          <div>
            {this.expansionButton()}&emsp;
            {name || type}
            {!!value && <span style={styles.isk}>{iskText}</span>}
          </div>
        </div>
        {!this.state.collapsed && this.listOfItemLines(items)}
      </div>
    );
  }
}

AssetContainer.propTypes = propTypes;
AssetContainer.defaultProps = defaultProps;

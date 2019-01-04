import React from 'reactn';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';
import AssetItem from './AssetItem';
import Misc from '../misc';
import collapsedImg from '../images/collapsed.png';
import expandedImg from '../images/expanded.png';

const propTypes = {};

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
    let lineStyle = this.props.index % 2 === 0 ? styles.isOdd : {};
    lineStyle = { ...lineStyle, ...styles.cell };
    const depthPadding = 40 * this.props.depth + 20;
    return (
      <div
        style={{ ...styles.row, ...lineStyle, paddingLeft: depthPadding }}
        key={item.item_id}
      >
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
        return (
          <AssetContainer asset={items[it]} depth={this.props.depth + 1} />
        );
      } else {
        orphans.push(it);
      }
    });
    const sortedOrphans = orphans.sort((a, b) => (items[b].price - items[a].price));
    const orphanItems = sortedOrphans.map((it, idx) => (
      <AssetItem asset={items[it]} depth={this.props.depth + 1} index={idx} />
    ));
    return containers.concat(orphanItems);
  }

  handleClick = e => {
    this.setState({ collapsed: !this.state.collapsed });
    e.preventDefault();
  };

  render() {
    const { region, items, value } = this.props.asset;
    let lineStyle = { ...styles.nonTableCell };
    lineStyle = { ...lineStyle, ...styles.structure };
    const depthPadding = 40 * this.props.depth;
    // orphans is a list of keys of items which are not containers
    return (
      <div>
        <div
          style={{ ...lineStyle, paddingLeft: depthPadding }}
          key={this.props.item_id || this.props.name}
          onClick={this.handleClick}
        >
          <div>
            {!this.state.collapsed && <img src={expandedImg} alt="+" />}
            {this.state.collapsed && <img src={collapsedImg} alt="-" />}
            &emsp;{this.props.name || this.props.asset.type}
            {value && (
              <span style={styles.isk}>{`${Misc.commarize(value)} ISK`}</span>
            )}
          </div>
          <div>{region}</div>
        </div>
        {!this.state.collapsed && this.listOfItemLines(items)}
      </div>
    );
  }
}

AssetContainer.propTypes = propTypes;
AssetContainer.defaultProps = defaultProps;

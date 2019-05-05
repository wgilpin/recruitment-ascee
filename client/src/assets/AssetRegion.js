import React from 'reactn';
import PropTypes from 'prop-types';
import TableStyles from '../evidence/TableStyles';
import AssetContainer from './AssetContainer';
import Misc from '../common/Misc';

const propTypes = {
  region: PropTypes.number,
};

const defaultProps = {
  assets: {},
  onClickHeader: null,
};

const styles = {
  ...TableStyles.styles,
  system: {
    width: '100%',
  },
  red: {
    color: 'red',
    fontWeight: 500,
  },
  regionName: {
    display: 'inline-block',
    textAlign: 'left',
    paddingLeft: '6px',
  },
  regionIsk: {
    display: 'inline-block',
    right: '64px',
    position: 'absolute',
  },
  regionHeader: {
    ...TableStyles.styles.folderHeader,
    ...TableStyles.styles.system,
    position: 'relative',
  },
};

export default class AssetRegion extends React.Component {
  sortByValue = (a, b) => {
    const region = this.global.assetSystems[this.props.region];
    return region.items[b].value - region.items[a].value;
  };

  render() {
    const { name, items, value } = this.global.assetSystems[this.props.region];
    return (
      <div style={styles.system}>
        <div style={styles.regionHeader} key={name}>
          <div style={styles.regionName}>{name}</div>
          <div style={styles.regionIsk}>{Misc.commarize(value)} ISK</div>
        </div>
        <div>
          {// systems first
          Object.keys(items)
            .sort(this.sortByValue)
            .map((it, idx) => (
              <AssetContainer
                name={items[it].name}
                asset={items[it]}
                index={idx}
                depth={1}
              />
            ))}
        </div>
      </div>
    );
  }
}

AssetRegion.propTypes = propTypes;

AssetRegion.defaultProps = defaultProps;

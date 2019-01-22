import React from 'reactn';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';
import AssetContainer from './AssetContainer';
import AssetItem from './AssetItem';
import Misc from '../common/Misc';


const propTypes = {
  systemId: PropTypes.number,
};

const defaultProps = {
  assets: {},
  onClickHeader: null,
};

const styles = {
  ...TableStyles.styles,
  system: {
    width: '100%',
  }
}

export default class AssetSystem extends React.Component {
  render() {
    const { name, region, items, value } = this.global.assetSystems[this.props.systemId];
    return (
      <div style={styles.system}>
        <div style={{ ...styles.folderHeader, ...styles.system }} key={name}>
          <div style={styles.cell}>{name}
            <span style={styles.isk}>{Misc.commarize(value)} ISK</span>
          </div>
          <div style={styles.cell}>{region}</div>
        </div>
        <div>
        {
          // structures first
          Object.keys(items).map((it, idx) => 
            items[it].location_type === 'structure' &&
              (<AssetContainer name={it} asset={items[it]} index={idx} depth={1}/>)
          ).concat(
          Object.keys(items).map((it, idx) => 
            items[it].location_type !== 'structure' &&
              (<AssetItem asset={items[it]} index={idx} depth={1}/>)
          ))
        }
        </div>
      </div>
    );
  }
}

AssetSystem.propTypes = propTypes;

AssetSystem.defaultProps = defaultProps;
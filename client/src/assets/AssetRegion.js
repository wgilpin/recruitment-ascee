import React from 'reactn';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';
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
  }
}

export default class AssetRegion extends React.Component {

  render() {
    let lineStyle = styles.system;
    const { name, items, value, redlisted } = this.global.assetSystems[this.props.region];
    if ((redlisted ||[]).length > 0) {
      lineStyle = { ...styles.system, ...styles.red };
    }
    return (
      <div style={styles.system}>
        <div style={{ ...styles.folderHeader, ...styles.system }} key={name}>
          <div style={styles.cell}>{name}
            <span style={styles.isk}>{Misc.commarize(value)} ISK</span>
          </div>
        </div>
        <div>
        {
          // systems first
          Object.keys(items).map((it, idx) =>
              <AssetContainer name={items[it].name} asset={items[it]} index={idx} depth={1}/>
          )
        }
        </div>
      </div>
    );
  }
}

AssetRegion.propTypes = propTypes;

AssetRegion.defaultProps = defaultProps;
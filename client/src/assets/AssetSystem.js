import React from 'react';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';
import AssetContainer from './AssetStructure';


const propTypes = {};

const defaultProps = {
  assets: {},
  onClickHeader: null,
};

const styles = {
  ...TableStyles.styles,
}

export default class AssetSystem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assets: props.assets,
    };
  }

  render() {
    const system = this.state.assets;
    const { name, region, items } = system;
    return (
      <React.Fragment>
        <div style={{...styles.row, ...styles.folderHeader}} key={name}>
          <div style={styles.cell}>{name}</div>
          <div style={styles.cell}>{region}</div>
        </div>
        <div>
        {
          Object.keys(items).map((it, idx) => {
            if (it.location_type === 'structure') {
              return (<AssetContainer asset={it} index={idx} depth={0}/>);
            }
          })
        }
        </div>
      </React.Fragment>
    );
  }
}

AssetSystem.propTypes = propTypes;

AssetSystem.defaultProps = defaultProps;
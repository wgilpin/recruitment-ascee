import React from 'react';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';


const propTypes = {};

const defaultProps = {
  assets: {},
  onClickHeader: null,
  index: 0,
  depth: 0,
};

const styles = {
  ...TableStyles.styles,
}

isEmpty(obj) {
  for (let key in obj){
    if (obj.hasOwnProperty(key)){
      return false;
    }
  }
  return true;
}

export default class AssetContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      assets: props.assets,
    };
  }

  getItemLine(item, index) {
    let lineStyle =
      (this.props.index % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    const depthPadding = 40 * this.props.depth + 20;
    return (
      <div style={{...styles.row, ...lineStyle, paddingLeft: depthPadding }} key={name}>
        <div>{name}</div>
      </div>
    )
  }

  render() {
    const structure = this.state.assets;
    const { name, region, items } = structure;
    let lineStyle =
      (this.props.index % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...styles.cell };
    const depthPadding = 40 * this.props.depth;
    // orphans is a list of keys of items which are not containers
    const orphans = [];
    return (
      <React.Fragment>
        <div style={{...styles.row, ...lineStyle, paddingLeft: depthPadding }} key={name}>
          <div>{name}</div>
          <div>{region}</div>
        </div>
        {
          Object.keys(items).map((it) => {
            // TODO: check for empty object
            if (!isEmpty(items[it].items)) {
              return <AssetContainer asset={items[it]} depth={this.props.depth + 1} />
            } else {
              orphans.push(it);
            }
          });
          orphans.sort((a,b) => a.name > b.name ? 1 : (b.name > a.name? -1 : 0))
          orphans.map((it, idx) => this.getitemLine(items[it], idx));
        }
      </React.Fragment>
    );
  }
}

AssetContainer.propTypes = propTypes;

AssetContainer.defaultProps = defaultProps;
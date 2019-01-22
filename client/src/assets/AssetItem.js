import React from 'reactn';
import PropTypes from 'prop-types';
import TableStyles from '../TableStyles';
import Misc from '../common/Misc';

const propTypes = {
  asset: PropTypes.object,
  depth: PropTypes.number
}

export default class AssetItem extends React.Component {
  constructor(props) {
    super(props);
    let lineStyle = this.props.index % 2 === 0 ? TableStyles.styles.isOdd : {};
    this.styles = {
      ...TableStyles.styles,
      row: {
        ...TableStyles.row,
        paddingLeft: 40 * (this.props.depth || 0),
        ...lineStyle,
      },
    }
  }
  render() {
    return <div style={this.styles.row}>
      <span style={this.styles.cell}>
        {this.props.asset.type}&ensp;
        {!this.props.asset.is_singleton && 
          (<React.Fragment>x {this.props.asset.quantity}&emsp;</React.Fragment>)}
        <span style={this.styles.iskLeft}>
          {Misc.commarize(this.props.asset.price * this.props.asset.quantity)} ISK
        </span>
      </span>
    </div>
  }
}

AssetItem.propTypes = propTypes;
import React from 'reactn';
import PropTypes from 'prop-types';
import TableStyles from '../evidence/TableStyles';
import Misc from '../common/Misc';

const propTypes = {
  asset: PropTypes.object,
  depth: PropTypes.number,
};

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
        position: 'relative',
        width: '-webkit-fill-available',
      },
      typeIcon: {
        width: '20px',
        height: '20px',
        position: 'relative',
        top: '5px',
        marginRight: '5px',
      },
      red: {
        color: 'red',
        fontWeight: 500,
      },
    };
  }
  render() {
    const isRed = (this.props.asset.redlisted || []).length > 0;
    const imgSrc = `https://image.eveonline.com/Type/${this.props.asset.type_id}_64.png`;
    return (
      <div style={this.styles.row}>
        <span
          style={{
            ...this.styles.cell,
            ...(isRed ? this.styles.red : {}),
          }}
        >
          <img
            style={this.styles.typeIcon}
            alt={this.props.asset.name}
            src={imgSrc}
          />
          {this.props.asset.name}&ensp;
          {!this.props.asset.is_singleton && (
            <span>x {this.props.asset.quantity}&emsp;</span>
          )}
          <span style={this.styles.iskLeft}>
            {Misc.commarize(this.props.asset.price * this.props.asset.quantity)}{' '}
            ISK
          </span>
        </span>
      </div>
    );
  }
}

AssetItem.propTypes = propTypes;

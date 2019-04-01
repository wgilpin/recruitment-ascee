import React from 'react';
import PropTypes from 'prop-types';
import RoundImage from './RoundImage';
import TableStyles from '../evidence/TableStyles';

const propTypes = {
  name: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  showPointer: PropTypes.bool,
  selected: PropTypes.bool,
  style: PropTypes.object,
};

const defaultProps = {};

export default class Alt extends React.Component {

  handleClick = () => {
    console.log('alt click');
    if (this.props.onClick) {
      console.log('alt click handled');
      this.props.onClick(this.props.id);
    }
  }

  render() {
    const { name, selected } = this.props;

    const styles = {
      ...TableStyles.styles,
      div: {
        padding: 8,
        display: 'table',
      },
      name: {
        size: 14,
        textAlign: 'left',
        paddingLeft: '8px',
        marginTop: 'auto',
        marginBottom: 'auto',
        height: '24px',
        verticalAlign: 'middle',
      },
      selected: {
        backgroundColor: '#222',
      },
    };

    let style = { ...styles.div, ...this.props.style };
    if (selected){
      style = {...style, ...styles.selected};
    }
    style.cursor = this.props.showPointer ? 'pointer' : null;

    return (
      <div style={style} onClick={this.handleClick}>
        <div style={styles.row}>
          <div style={styles.cell}>
            <RoundImage src={`https://image.eveonline.com/Character/${this.props.id}_64.jpg`} />
          </div>
          <div style={{ ...styles.cell, ...styles.name}}>{name}</div>
        </div>
      </div>
    );
  }
}

Alt.propTypes = propTypes;
Alt.defaultProps = defaultProps;
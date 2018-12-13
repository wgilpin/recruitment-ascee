import React from 'react';
import PropTypes from 'prop-types';
import RoundImage from './RoundImage';

const propTypes = {
  name: PropTypes.string,
  src: PropTypes.string,
  id: PropTypes.string,
  onClick: PropTypes.func,
  selected: PropTypes.bool,
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
    const { size, src, name, selected } = this.props;

    const styles = {
      div: {
        padding: 8,
        display: 'grid',
        gridTemplateColumns: `${size || '32px'} auto`,
        gridTemplateRows: '50',
        gridColumnGap: 18,
        gridRowGap: 18,
      },
      span: {
        size: 14,
        textAlign: 'left',
      },
      selected: {
        backgroundColor: '#222',
      }
    };

    let style = styles.div;
    if (selected){
      style = {...style, ...styles.selected};
    }

    return (
      <div style={style} onClick={this.handleClick}>
        <RoundImage src={src}></RoundImage>
        <span style={styles.span}>{name}</span>
      </div>
    );
  }
}

Alt.propTypes = propTypes;
Alt.defaultProps = defaultProps;
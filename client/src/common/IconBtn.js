import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  label: PropTypes.string,
  onClick: PropTypes.func,
};

const defaultProps = {

};

const styles = {
  buttonOuter: {
    margin: '6px',
    padding: '6px 12px',
    // backgroundColor: 'black',
    color: 'darkgrey',
    border: '1px solid grey',
    borderRadius: '4px',
    textAlign: 'left',
  },
  image: {
    width: '22px',
  },
  text: {
    position: 'relative',
    top: '-6px',
    left: '4px',
  }
}

export default class IconBtn extends React.Component {
  handleClick = ()=>{
    if (this.props.onClick) {
      this.props.onClick();
    }
  }

  render() {
    return (
      <div style={{...styles.buttonOuter, ...this.props.style }} onClick={this.handleClick}>
        <img style={styles.image} src={this.props.src} alt={this.props.src} />
        <span style={styles.text}>{this.props.label}</span>
      </div>
    );
  }
}

 IconBtn.propTypes = propTypes;
 IconBtn.defaultProps = defaultProps;
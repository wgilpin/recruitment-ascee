import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  src: PropTypes.string,
  onClick: PropTypes.func,
  name: PropTypes.string,
  size: PropTypes.number,
  color: PropTypes.string,
  altText: PropTypes.string,
  position: PropTypes.string,
  distance: PropTypes.string,
  shadow: PropTypes.bool,
};

export default class RoundImage extends React.Component<Props> {
  handleClick = () => {
    if (this.props.onClick) {
      console.log('round click');
      this.props.onClick(this.props.name);
    }
  };

  render() {
    const imgStyle = {
      borderRadius: '50%',
      width: 32,
      height: 32,
      backgroundColor: this.props.color || 'black',
      boxShadow: '1px 3px 1px #111',
      ...(this.props.style || {}),
    };
    return (
      < >
        <img
          src={this.props.src}
          alt={this.props.altText || 'Avatar'}
          style={imgStyle}
          onClick={this.handleClick}
        />
      </>
    );
  }
}

RoundImage.propTypes = propTypes;

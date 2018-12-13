import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  src: PropTypes.string,
  onClick: PropTypes.func,
  name: PropTypes.string,
  size: PropTypes.number,
};

export default class RoundImage extends React.Component<Props> {
  handleClick = () => {
    if (this.props.onClick){
      console.log('round click')
      this.props.onClick(this.props.name);
    }
  }

  render() {
    const imgStyle = {
      borderRadius: '50%',
      width: this.props.size || 32,
      height: this.props.size || 32,
    };
    return (
      <React.Fragment>
        <img src={ this.props.src } alt="Avatar" style={ imgStyle } onClick={this.handleClick}/>
      </React.Fragment>
    );
  }
}

RoundImage.propTypes = propTypes;
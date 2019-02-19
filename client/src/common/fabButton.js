import React from 'react';
import PropTypes from 'prop-types';
import addImg from '../images/add.gif';
import RoundImage from './RoundImage';

const styles = {
  fabFixed: {
    position: 'absolute',
    bottom: '30px',
    right: '30px',
  },
};

type Props = {
  label: PropTypes.string,
  color: PropTypes.string,
  style: PropTypes.any,
};

export const FabButton = (props: Props) => {
  const appliedStyle = { ...styles.fabFixed, ...(props.style || {})};
  return (
    <RoundImage
      onClick={props.onClick}
      aria-label={props.label}
      color={props.color}
      style={appliedStyle}
      src={addImg}
      altText='Add Alt'
      shadow={true}
      size={props.size}
    />
  );
};

FabButton.defaultProps = {
  icon: 'add',
  label: '',
  secondary: false,
};

export default FabButton;
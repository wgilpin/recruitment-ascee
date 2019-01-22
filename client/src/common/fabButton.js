import React from 'react';
import PropTypes from 'prop-types';
import addImg from '../images/add.gif';
import RoundImage from './RoundImage';

const styles = {
  fabFixed: {
    position: 'fixed',
    bottom: '12px',
  },
};

type Props = {
  label: PropTypes.string,
  color: PropTypes.string,
};

export const FabButton = (props: Props) => {
  return (
    <RoundImage
      aria-label={props.label}
      color={props.color}
      style={styles.fabFixed}
      src={addImg}
      altText='Add Alt'
      position='absolute'
      distance='30px'
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
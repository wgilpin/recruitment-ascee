import React from 'react';
import PropTypes from 'prop-types';
import ApplicationHistory from '../evidence/ApplicationHistory';
import FindESICharacter from '../admin/FindESICharacter';
import OpenImg from '../images/arrow_forward.png';

const propTypes = {
  id: PropTypes.number,
  onChoose: PropTypes.func,
};

const defaultProps = {};

const localStyles = {
  search: {
    marginTop: '20px',
  },
  section: {
    backgroundColor: '#333',
  },
};

export default function Search(props) {
  return (
    <div style={localStyles.search}>
      <div style={{ ...localStyles.section, padding: '12px' }}>
        <ApplicationHistory applicantId={props.id} showall />
        <div>
          <FindESICharacter
            onChange={props.onChoose}
            iconList={[{ name: 'open', img: OpenImg }]}
          />
        </div>
      </div>
    </div>
  );
}

Search.propTypes = propTypes;
Search.defaultProps = defaultProps;

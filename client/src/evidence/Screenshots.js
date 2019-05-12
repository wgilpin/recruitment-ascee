import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from '../common/FetchData';

const propTypes = {};

const defaultProps = {};

const styles = {
  img: {
    height: '400px',
  },
};

export default class Screenshots extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      urls: [],
    };
  }

  componentDidMount = () => {
    new FetchData({ scope: 'user/images', id: this.props.targetId })
      .get()
      .then(({ info }) => {
        this.setState({ urls: info });
      });
  };

  render() {
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    return (
      <React.Fragment>
        {this.state.urls.map(url => (
          <img key={url.id} style={styles.img} alt="" src={url.url} />
        ))}
      </React.Fragment>
    );
  }
}

Screenshots.propTypes = propTypes;
Screenshots.defaultProps = defaultProps;

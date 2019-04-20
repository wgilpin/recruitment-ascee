import React from 'react';
import Loader from 'react-loader-spinner';
import DeleteImg from '../images/baseline_delete_white_24dp.png';
import FetchData from '../common/FetchData';

const styles = {
  fadein: {
    animation: 'fadein 2s',
  },
};

export default class Images extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      images: [],
      loading: true,
    }
  }

  fetchImages = () => {
    new FetchData({scope: 'user/images'})
      .get()
      .then(({info}) => this.setState({ images: info, loading: false }));

  }
  componentDidMount() {
    this.fetchImages();
  }

  render() {
    if (this.state.loading) {
      return (
        <Loader
          type="Puff"
          color="#01799A"
          height="100"
          width="100"
        />)
    }
    return this.props.images.map((image, i) => (
      <div key={i} style={styles.fadein}>
        <div
          onClick={() => this.props.removeImage(image.public_id)}
          className="delete"
        >
          <img src={DeleteImg} alt="delete" />
        </div>
        <img src={image.url} alt="" />
      </div>
    ));
  }
}

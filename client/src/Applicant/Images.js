import React from 'react';
import Loader from 'react-loader-spinner';
import DeleteImg from '../images/delete.png';
import FetchData from '../common/FetchData';
import LoginImg from '../images/LoginScreen.png';
import Buttons from './Buttons';
import Confirm from '../common/Confirm';

const styles = {
  fadein: {
    animation: 'fadein 2s',
  },
};

export default class Images extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      images: [],
      loading: true,
      showConfirm: false,
    };
  }

  fetchImages = () => {
    new FetchData({ scope: 'user/images' })
      .get()
      .then(({ info }) => {
        if (info.length !== this.state.images.length){
          this.props.onChangeCount(info.length);
        }
        this.setState({ images: info, loading: false })});
  };

  componentDidMount() {
    this.fetchImages();
  }

  removeImage = id => {
    this.setState({
      showConfirm: true,
      selectedImageId: id,
    });
  };

  doConfirmed = () => {
    new FetchData({
      scope: 'user/image',
      id: this.state.selectedImageId,
      param1: 'delete',
    })
      .get()
      .then(() =>
        this.setState({
          images: this.state.images.filter(
            image => image.id !== this.state.selectedImageId
          ),
          showConfirm: false,
          selectedImageId: null,
        })
      );
  };

  render() {
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    const { images } = this.state;
    return (
      <div>
        {images.length === 0 && (
          <React.Fragment>
            <p>For example</p>
            <img style={{ width: '200px' }} src={LoginImg} alt="" />
          </React.Fragment>
        )}
        <Buttons onChange={this.props.onChange} />
        {images.map((image, i) => (
          <div key={i} style={styles.fadein}>
            {this.props.canDelete && (
              <div
                style={{ display: 'inline-block' }}
                onClick={() => this.removeImage(image.id)}
                className="delete"
              >
                <img
                  style={{ cursor: 'pointer' }}
                  src={DeleteImg}
                  alt="delete"
                />
              </div>
            )}
            <img src={image.url} alt="screenshot" style={{ maxWidth: '100%' }} />
          </div>
        ))}
        {this.state.showConfirm && (
          <Confirm
            text={'Delete Image'}
            onConfirm={this.doConfirmed}
            onClose={() => this.setState({ showConfirm: false })}
          />
        )}
      </div>
    );
  }
}

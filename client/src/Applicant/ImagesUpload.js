
import React from 'react'
import Loader from 'react-loader-spinner';
import Images from './Images'
import Buttons from './Buttons'
import FetchData from '../common/FetchData';
import styles from './ApplicantStyles';
import LoginImg from '../images/LoginScreen.png';


export default class ImagesUpload extends React.Component{
  
  state = {
    uploading: false,
    images: []
  }

  onChange = e => {
    const files = Array.from(e.target.files)
    this.setState({ uploading: true })

    const formData = new FormData()

    files.forEach((file, i) => {
      formData.append(i, file)
    })

    new FetchData({ scope: '/api/image_upload'})
    .post(formData)
    .then(res => res.json())
    .then(images => {
      this.setState({ 
        uploading: false,
        images
      })
    })
  }

  removeImage = id => {
    this.setState({
      images: this.state.images.filter(image => image.public_id !== id)
    })
  }
  
  render() {
    const { uploading, images } = this.state

    const content = () => {
      switch(true) {
        case uploading:
          return <Loader />
        case images.length > 0:
          return <Images images={images} removeImage={this.removeImage} />
        default:
          return <Buttons onChange={this.onChange} />
      }
    }

    return (
      <div>
        <h2 style={styles.heading}>Upload Character Selection Screenshots</h2>
        <p>For ALL of your accounts, take a screenshot, save it then upload them all here.</p>
        <p>For example</p>
        <img style={{width: '200px'}}src={LoginImg} alt="" />
        <div className='buttons'>
          {content()}
        </div>
      </div>
    )
  }
}

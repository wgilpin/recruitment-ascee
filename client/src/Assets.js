import React from 'reactn';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from './common/FetchData';
import AssetSystem from './assets/AssetSystem';

const propTypes = {
  alt: PropTypes.string,
  assetsList: PropTypes.array,
};

const defaultProps = {};


export default class Assets extends React.Component {
  constructor(props) {
    super(props);
    this.scope = 'assets';
    this.setGlobal({ assets: {}, assetSystems: {}});
    this.state = {
      loading: true,
    }
  }

  recurseValues(item) {
    let price = (item.price || 0) * (item.quantity || 1);
    let value = 0;
    Object.keys(item.items).forEach((key) => {
      value += this.recurseValues(item.items[key])
    })
    item.value = value;
    return price + value;
  }

  jsonToSystemsList(data) {
    this.setState({ loading: false });
    if (data) {
      const keys = Object.keys(data);
      const systems = {};
      keys.forEach(key => {
        if (data[key].location_type === 'system') {
          systems[key] = data[key];
        }
      });
      Object.keys(systems).forEach((sysKey) => {
        systems[sysKey].value = this.recurseValues(systems[sysKey]);
      })
      this.setGlobal({ assets: data, assetCount: keys.length, assetSystems: systems });
    }
  }

  onError = err => {
    console.error(err);
  };

  componentDidMount() {
    let fetch = new FetchData(
      { id: this.props.alt, scope: 'character', param1: 'assets' },
      this.onLoaded,
      this.onError,
    );
    fetch.get().then(data => this.jsonToSystemsList(data));
  }


  render() {
    if (this.state.loading) {
      return(
      <Loader
        type="Puff"
        color="#01799A"
        height="100"
        width="100"
      />)
    }
    return Object
      .keys(this.global.assetSystems || {})
      .sort((a,b) => this.global.assetSystems[b].value - this.global.assetSystems[a].value)
      .map((system, idx) =>
        (system !== 'value' ? <AssetSystem systemId={system} /> : null ));
  }
}

Assets.propTypes = propTypes;
Assets.defaultProps = defaultProps;

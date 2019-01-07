import React from 'reactn';
import PropTypes from 'prop-types';
import FetchData from './FetchData';
import TableStyles from './TableStyles';
import AssetSystem from './assets/AssetSystem';
import AssetStructure from './assets/AssetContainer';

const propTypes = {
  alt: PropTypes.string,
  assetsList: PropTypes.array,
};

const defaultProps = {};

const styles = TableStyles.styles;

export default class Assets extends React.Component {
  constructor(props) {
    super(props);
    this.scope = 'assets';
    this.setGlobal({ assets: {}, assetSystems: {}})
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

  jsonToSystemsList(json) {
    if (json && json.info) {
      const keys = Object.keys(json.info);
      const systems = {};
      keys.forEach(key => {
        if (json.info[key].location_type === 'system') {
          systems[key] = json.info[key];
        }
      });
      Object.keys(systems).forEach((sysKey) => {
        systems[sysKey].value = this.recurseValues(systems[sysKey]);
      })
      this.setGlobal({ assets: json.info, assetCount: keys.length, assetSystems: systems });
    }
  }

  onError = err => {
    console.error(err);
  };

  componentDidMount() {
    let fetch = new FetchData(
      { id: this.props.alt, scope: this.scope },
      this.onLoaded,
      this.onError,
    );
    fetch.get().then(data => this.jsonToSystemsList(data));
  }

  
  render() {
    return Object
      .keys(this.global.assetSystems || {})
      .sort((a,b) => this.global.assetSystems[b].value - this.global.assetSystems[a].value)
      .map((system, idx) => 
        (system !== 'value' ? <AssetSystem systemId={system} /> : null ));
  }
}

Assets.propTypes = propTypes;
Assets.defaultProps = defaultProps;

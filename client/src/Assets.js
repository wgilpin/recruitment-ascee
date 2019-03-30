import React from 'reactn';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from './common/FetchData';
import AssetRegion from './assets/AssetRegion';

const propTypes = {
  alt: PropTypes.string,
  assetsList: PropTypes.array,
};

const defaultProps = {};

export default class Assets extends React.Component {
  constructor(props) {
    super(props);
    this.setGlobal({ assets: {}, assetSystems: {} });
    this.state = {
      loading: true,
    };
  }

  recurseValuesAndRedlist(item) {
    let price = (item.price || 0) * (item.quantity || 1);
    let value = 0;
    let hasRedChild = false;
    item.redlisted = item.redlisted || [];
    Object.keys(item.items || {}).forEach(key => {
      if ((item.items[key].redlisted || []).length > 0) {
        // redlisted child, so we are too
        hasRedChild = true;
      }
      const recVals = this.recurseValuesAndRedlist(item.items[key]);
      value += recVals.value;
      hasRedChild = hasRedChild || recVals.isRed;
    });
    if (hasRedChild) {
      if (!('child' in item.redlisted)) {
        item.redlisted.push('child');
      }
    }
    item.value = value;
    return { value: price + value, isRed: hasRedChild };
  }

  jsonToSystemsList(systems) {
    this.setState({ loading: false });
    if (systems) {
      Object.keys(systems).forEach(sysKey => {
        systems[sysKey].redlisted = systems[sysKey].redlisted || [];
        const systemValues = this.recurseValuesAndRedlist(systems[sysKey]);
        systems[sysKey].value = systemValues.value;
        if (systemValues.isRed && !('child' in systems[sysKey].redlisted)) {
          systems[sysKey].redlisted.push('child');
        }
      });
      this.setGlobal({ assetSystems: systems });
    }
  }

  onError = err => {
    console.error(err);
  };

  componentDidMount() {
    let fetch = new FetchData(
      { id: this.props.alt, scope: 'character', param1: 'assets' },
      this.onLoaded,
      this.onError
    );
    fetch.get().then(data => this.jsonToSystemsList(data));
  }

  render() {
    if (this.state.loading) {
      return <Loader type="Puff" color="#01799A" height="100" width="100" />;
    }
    return Object.keys(this.global.assetSystems || {})
      .sort(
        (a, b) =>
          this.global.assetSystems[b].value - this.global.assetSystems[a].value
      )
      .map((system, idx) =>
        system !== 'value' ? <AssetRegion region={system} /> : null
      );
  }
}

Assets.propTypes = propTypes;
Assets.defaultProps = defaultProps;

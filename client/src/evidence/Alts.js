import React from 'react';
import PropTypes from 'prop-types';
import Alt from '../common/Alt';
import FetchData from '../common/FetchData';
import ApplicationHistory from './ApplicationHistory';
import AltSummary from './AltSummary';

const propTypes = {
  onAltSelect: PropTypes.func,
  onCorpSelect: PropTypes.func,
  main: PropTypes.number,
  childrenTop: PropTypes.bool,
  highlightMain: PropTypes.bool,
  showPointer: PropTypes.bool,
  style: PropTypes.object,
};

const defaultProps = {
  main: null,
  childrenTop: false,
  highlightMain: false,
  showPointer: false,
};

const styles = {
  outer: {
    height: '100%',
    position: 'relative',
    textAlign: 'left',
    padding: '8px',
  },
  div: {
    display: 'block',
  },
  hr: {
    borderColor: '#555',
  },
  sectionTitle: {
    fontWeight: 600,
    color: '#01799A',
    marginBottom: '6px',
  },
};
export default class Alts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alts: props.alts };
  }

  handleClickAlt = altId => {
    if (this.props.onAltSelect) {
      this.loadCharacterSummary(altId);
      this.setState({ selected: altId });
      this.props.onAltSelect(altId);
    }
  };

  handleClickCorp = corpId => {
    const { corporations, corporationId, selected } = this.state;
    if (
      this.props.onCorpSelect &&
      (corporations[corporationId] || {}).ceo_id === parseInt(selected)
    ) {
      this.props.onCorpSelect(corpId);
    }
  };

  loadCharacterSummary = altId => {
    const fetcher = this.props.fetcher || this.doFetch;

    return fetcher({ id: altId, scope: 'character', param2: 'summary' })
      .then(({ info }) => {
        return this.setState({
          corporationName: info.corporation_name,
          corporationId: info.corporation_id,
          alliance: info.alliance_name,
          secStatus: info.security_status,
          corpRedlisted: 'corporation_name' in info.redlisted,
          applicationId: info.current_application_id,
        })
      }
      )
      .catch(e => console.log(e));
  };

  loadCharacters = () => {
    const fetcher = this.props.fetcher || this.doFetch;
    fetcher({ id: this.props.main, scope: 'user/characters' })
      .then(data => {
        let mainData;
        if (this.props.highlightMain) {
          mainData = data.info[this.props.main];
          delete data.info[this.props.main];
        }
        this.setState({ alts: data.info, main: mainData }, () =>
          this.loadCharacterSummary(this.props.main)
        );
      })
      .catch(err => console.log(err));
  };

  loadCorporations = () => {
    const fetcher = this.props.fetcher || this.doFetch;
    fetcher({ id: this.props.main, scope: 'user/corporations' })
      .then(data => this.setState({ corporations: data.info }))
      .catch(err => console.log(err));
  };

  doFetch = (scope, params) => new FetchData(scope).get(params);

  componentDidMount() {
    this.loadCharacters();
    this.loadCorporations();
  }

  showHistory = appHistory => {
    if (this.props.onShowHistory) {
      this.props.onShowHistory(appHistory);
    }
  };

  render() {
    const hasAlts = Object.keys(this.state.alts || {}).length > 0;
    const {
      selected,
      alts,
      applicationId,
      corporations,
      corporationId,
      corpRedlisted,
      corporationName,
      secStatus,
    } = this.state;
    const { main, children } = this.props;
    return (
      <div style={{ ...styles.outer, ...this.props.style }}>
        {this.props.childrenTop && children}
        <hr style={styles.hr} />
        {this.props.highlightMain &&
          main &&
          this.state.main && [
            <div style={styles.sectionTitle}>Main</div>,
            <Alt
              style={styles.div}
              name={this.state.main.name}
              id={main}
              selected={selected === main}
              onClick={this.handleClickAlt}
              showPointer={this.props.showPointer}
            />,
            selected === main && (
              <AltSummary
                corporations={corporations}
                selected={selected}
                corporationId={corporationId}
                corpRedlisted={corpRedlisted}
                corporationName={corporationName}
                secStatus={secStatus}
                onClickCorp={this.handleClickCorp}
              />
            ),
            <div style={styles.summary}>
              <ApplicationHistory
                applicantId={main}
                applicationId={applicationId}
                onShowHistory={this.showHistory}
              />
            </div>,
            <hr style={styles.hr} />,
          ]}
        {hasAlts && <div style={styles.sectionTitle}>Alts</div>}
        {Object.keys(alts || {}).map(key => {
          const alt = alts[key];
          return <div key={key}>
            <Alt
              style={styles.div}
              name={alt.name}
              id={key}
              selected={selected === key}
              onClick={this.handleClickAlt}
            />
            {selected === key && (
              <AltSummary
                corporations={corporations}
                selected={selected}
                corporationId={corporationId}
                corpRedlisted={corpRedlisted}
                corporationName={corporationName}
                secStatus={secStatus}
                onClickCorp={this.handleClickCorp}
              />
            )}
          </div>
        })}
        {!this.props.childrenTop && children}
        {hasAlts && <hr style={styles.hr} />}
      </div>
    );
  }
}

Alts.propTypes = propTypes;
Alts.defaultProps = defaultProps;

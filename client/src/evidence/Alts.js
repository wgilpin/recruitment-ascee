import React from "react";
import PropTypes from "prop-types";
import Alt from "../common/Alt";
import FetchData from "../common/FetchData";

const propTypes = {
  onAltSelect: PropTypes.func,
  onCorpSelect: PropTypes.func,
  main: PropTypes.number,
  childrenTop: PropTypes.bool,
  highlightMain: PropTypes.bool,
  showPointer: PropTypes.bool,
  style: {}
};

const defaultProps = {
  main: null,
  childrenTop: false,
  highlightMain: false,
  showPointer: false
};

const styles = {
  outer: {
    height: "100%",
    position: "relative",
    textAlign: "left",
    padding: "8px"
  },
  div: {
    display: "block"
  },
  hr: {
    borderColor: "#555"
  },
  sectionTitle: {
    fontWeight: 600,
    color: "#01799A",
    marginBottom: "6px"
  },
  corporation: {
    maxWidth: "300px"
  },
  corpCEO: {
    cursor: "pointer",
    textDecoration: "underline",
    color: "#01799A",
    maxWidth: "300px"
  },
  secStatus: {
    fontWeight: 500
  },
  red: {
    color: "red",
    fontWeight: 500
  },
  summary: {
    backgroundColor: "#222",
    padding: "4px"
  }
};
export default class Alts extends React.Component {
  constructor(props) {
    super(props);
    this.state = { alts: props.alts };
  }

  handleClickAlt = altId => {
    this.loadCharacterSummary(altId);
    this.setState({ selected: altId });
    if (this.props.onAltSelect) {
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
    return new FetchData({ id: altId, scope: "character", param2: "summary" })
      .get()
      .then(({ info }) =>
        this.setState({
          corporationName: info.corporation_name,
          corporationId: info.corporation_id,
          alliance: info.alliance_name,
          secStatus: info.security_status,
          corpRedlisted: "corporation_name" in info.redlisted
        })
      );
  };

  componentDidMount() {
    new FetchData({ id: this.props.main, scope: "user/characters" })
      .get()
      .then(data => {
        let mainData;
        if (this.props.highlightMain) {
          mainData = data.info[this.props.main];
          delete data.info[this.props.main];
        }
        this.setState({ alts: data.info, main: mainData });
      })
      .catch(err => console.log(err));
    new FetchData({ id: this.props.main, scope: "user/corporations" })
      .get()
      .then(data => this.setState({ corporations: data.info }))
      .catch(err => console.log(err));
  }

  renderSummary() {
    const { corporations, selected, corporationId, corpRedlisted } = this.state;
    const isCEO =
      (corporations[corporationId] || {}).ceo_id === parseInt(selected);
    let corpStyle = isCEO ? styles.corpCEO : styles.corporation;
    if (corpRedlisted) {
      corpStyle = { ...corpStyle, ...styles.red };
    }
    return (
      <div style={styles.summary}>
        <div>
          <div style={styles.secStatus}>
            Sec Status: {Math.round(this.state.secStatus * 100) / 100}
          </div>
          <div>
            Corp {isCEO && "[CEO]"}&emsp;
            <span
              style={corpStyle}
              onClick={() => this.handleClickCorp(this.state.corporationId)}
            >
              {this.state.corporationName}
            </span>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const hasAlts = Object.keys(this.state.alts || {}).length > 0;
    return (
      <div style={{ ...styles.outer, ...this.props.style }}>
        {this.props.childrenTop && this.props.children}
        <hr style={styles.hr} />
        {this.props.highlightMain &&
          this.state.main && [
            <div style={styles.sectionTitle}>Main</div>,
            <Alt
              style={styles.div}
              name={this.state.main.name}
              id={this.props.main}
              selected={this.state.selected === this.props.main}
              onClick={this.handleClickAlt}
              showPointer={this.props.showPointer}
            />,
            this.state.selected === this.props.main && this.renderSummary(),
            <hr style={styles.hr} />
          ]}
        {hasAlts && <div style={styles.sectionTitle}>Alts</div>}
        {Object.keys(this.state.alts || {}).map(key => {
          const alt = this.state.alts[key];
          return [
            <Alt
              style={styles.div}
              name={alt.name}
              id={key}
              selected={this.state.selected === key}
              onClick={this.handleClickAlt}
            />,
            this.state.selected === key && this.renderSummary()
          ];
        })}
        {!this.props.childrenTop && this.props.children}
        {hasAlts && <hr style={styles.hr} />}
      </div>
    );
  }
}

Alts.propTypes = propTypes;
Alts.defaultProps = defaultProps;

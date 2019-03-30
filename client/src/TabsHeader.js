import React from 'react';
import PropTypes from 'prop-types';
import RoundImage from './common/RoundImage';
import walletImg from './images/wallet.png';
import assetsImg from './images/assets.png';
import mailImg from './images/evemail.png';
import skillsImg from './images/skills.png';
import blueprintImg from './images/blueprints.png';
import bookmarkImg from './images/personallocations.png';
import contractsImg from './images/contracts.png';
import calendarImg from './images/calendar.png';
import marketImg from './images/market.png';
import contactsImg from './images/contacts.png';
import PIImg from './images/planetarycommodities.png';
import fittingsImg from './images/fitting.png';
import industryImg from './images/Industry.png';

const propTypes = {
  onTabChange: PropTypes.func,
};

const defaultProps = {};

const styles = {
  div: {
    display: 'table',
    // gridTemplateColumns: 'auto',
    // gridTemplateRows: 'auto 32px',
    // gridColumnGap: '20px',
    // gridRowGap: '10px',
    justifyItems: 'center',
  },
  headerRow: {
    display: 'table-row',
  },
  textRow: {
    display: 'table-row',
  },
  cell: {
    display: 'table-cell',
    width: '50px',
    padding: '8px',
  },
  span: {
    color: '#01799A',
    gridRow: 2,
    fontWeight: 600,
  },
  selected: {
    textDecoration: 'underline overline',
    fontWeight: 600,
  }
};

export default class TabsHeader extends React.Component {
  constructor(props) {
    super(props);
    console.log('cons', this);
    this.state = {
      selected: null,
    };
  }

  showTab = (name) => {
    //open the tab
    console.log('tabsHeader click ');

    if (this.props.onTabChange) {
      console.log('tabsHeader click handled ');

      this.props.onTabChange(name);
      this.setState({ selected: name })
    }
  }

  build_tab_icons(col,image, name) {
    let textStyle;
    if (this.state.selected === name){
      textStyle = { gridColumn: col, ...styles.span, ...styles.selected };
    }
    else {
      textStyle = { gridColumn: col, ...styles.span }
    }
    return (
      <React.Fragment>
      <RoundImage style={{ gridColumn: col, gridRow: 1 }} size={40} src={image} onClick={this.showTab} name={name}/>
      <span style={textStyle} onClick={this.showTab} name={name}>{name}</span>
      </React.Fragment>
    )
  }

  render() {
    return (
      <div style={styles.div}>
        <div style={styles.headerRow}>
          <div style={styles.cell}>
            <RoundImage size={40} src={walletImg} onClick={this.showTab} name={ 'Wallet'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={contactsImg} onClick={this.showTab} name={'Contacts'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={assetsImg} onClick={this.showTab} name={'Assets'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={skillsImg} onClick={this.showTab} name={'Skills'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={bookmarkImg} onClick={this.showTab} name={'Bookmarks'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={blueprintImg} onClick={this.showTab} name={'Blueprints'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={mailImg} onClick={this.showTab} name={'Mail'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={contractsImg} onClick={this.showTab} name={'Contracts'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={calendarImg} onClick={this.showTab} name={'Calendar'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={marketImg} onClick={this.showTab} name={'Market'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={fittingsImg} onClick={this.showTab} name={'Fittings'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={industryImg} onClick={this.showTab} name={'Industry'} />
          </div>
          <div style={styles.cell}>
            <RoundImage size={40} src={PIImg} onClick={this.showTab} name={'PI'} />
          </div>
        </div>
        <div style={styles.textRow}>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Wallet')}>Wallet</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Contacts')}>Contacts</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Assets')}>Assets</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Skills')}>Skills</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Bookmarks')}>Bookmarks</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Blueprints')}>Blueprints</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Mail')}>Mail</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Contracts')}>Contracts</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Calendar')}>Calendar</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Market')}>Market</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Fittings')}>Fittings</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('Industry')}>Industry</div>
          </div>
          <div style={styles.cell}>
            <div style={styles.span} onClick={() => this.showTab('PI')}>PI</div>
          </div>
        </div>
      </div>
    );
  }
}

TabsHeader.propTypes = propTypes;
TabsHeader.defaultProps = defaultProps;
import React from 'react';
import PropTypes from 'prop-types';
import RoundImage from '../common/RoundImage';
import notesImg from '../images/notepad.png';
import walletImg from '../images/wallet.png';
import assetsImg from '../images/assets.png';
import mailImg from '../images/evemail.png';
import skillsImg from '../images/skills.png';
import blueprintImg from '../images/blueprints.png';
import bookmarkImg from '../images/personallocations.png';
import contractsImg from '../images/contracts.png';
import calendarImg from '../images/calendar.png';
import marketImg from '../images/market.png';
import contactsImg from '../images/contacts.png';
import PIImg from '../images/planetarycommodities.png';
import fittingsImg from '../images/fitting.png';
import clonesImg from './images/cloneBay.png';
import industryImg from '../images/Industry.png';

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
    cursor: 'pointer',
  },
  span: {
    color: '#01799A',
    gridRow: 2,
    fontWeight: 600,
  },
  selected: {
    textDecoration: 'underline overline',
    fontWeight: 600,
  },
};

const displayOrder = {
  0: { name: 'Notes', src: notesImg, includeForCorp: true },
  1: { name: 'Wallet', src: walletImg, includeForCorp: true },
  2: { name: 'Mail', src: mailImg },
  3: { name: 'Assets', src: assetsImg, includeForCorp: true },
  4: { name: 'Contacts', src: contactsImg, includeForCorp: true },
  5: { name: 'Skills', src: skillsImg },
  6: { name: 'Bookmarks', src: bookmarkImg, includeForCorp: true },
  7: { name: 'Market', src: marketImg },
  8: { name: 'Fittings', src: fittingsImg },
  9: { name: 'Industry', src: industryImg, includeForCorp: true },
  10: { name: 'Blueprints', src: blueprintImg },
  11: { name: 'Contracts', src: contractsImg },
  12: { name: 'PI', src: PIImg },
  13: { name: 'Calendar', src: calendarImg },
};


export default class TabsHeader extends React.Component {
  constructor(props) {
    super(props);
    console.log('cons', this);
    this.state = {
      selected: null,
    };
  }

  showTab = name => {
    //open the tab
    console.log('tabsHeader click ');

    if (this.props.onTabChange) {
      console.log('tabsHeader click handled ');

      this.props.onTabChange(name);
      this.setState({ selected: name });
    }
  };

  build_tab_icons(col, image, name) {
    let textStyle;
    if (this.state.selected === name) {
      textStyle = { gridColumn: col, ...styles.span, ...styles.selected };
    } else {
      textStyle = { gridColumn: col, ...styles.span };
    }
    return [
      <RoundImage
        style={{ gridColumn: col, gridRow: 1 }}
        size={40}
        src={image}
        onClick={this.showTab}
        name={name}
      />,
      <span style={textStyle} onClick={this.showTab} name={name}>
        {name}
      </span>,
    ];
  }

  static displayOrder = {
    1: { name: 'Wallet', src: walletImg, includeForCorp: true },
    2: { name: 'Contacts', src: contactsImg, includeForCorp: true },
    3: { name: 'Assets', src: assetsImg, includeForCorp: true },
    4: { name: 'Bookmarks', src: bookmarkImg, includeForCorp: true },
    5: { name: 'Industry', src: industryImg, includeForCorp: true },
    6: { name: 'Skills', src: skillsImg },
    7: { name: 'Blueprints', src: blueprintImg },
    8: { name: 'Mail', src: mailImg },
    9: { name: 'Calendar', src: calendarImg },
    10: { name: 'Market', src: marketImg },
    11: { name: 'Fittings', src: fittingsImg },
    12: { name: 'Clones', src: clonesImg },
    13: { name: 'Contracts', src: contractsImg },
    14: { name: 'PI', src: PIImg },
  };


  renderItems(displayItems) {
    const pageIsACorp = !!this.props.corporation;
    const displayItems = Object.keys(displayOrder)
      .filter(seq => !pageIsACorp || displayOrder[seq].includeForCorp)
      .sort()
      .map(seq => displayOrder[seq]);
    return (
      <div style={styles.div}>
        <div style={styles.headerRow}>
          {displayItems.map(({ src, name }) => (
            <div style={styles.cell}>
              <RoundImage
                size={40}
                src={src}
                onClick={() => this.showTab(name)}
                name={displayOrder[name]}
                corporation={pageIsACorp}
              />
            </div>
          ))}
        </div>
        <div style={styles.textRow}>
          {displayItems.map(({ src, name }) => (
            <div style={styles.cell}>
              <div style={styles.span} onClick={() => this.showTab(name)}>
                {name}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  render() {
    const pageIsACorp = !!this.props.corporation;
    if (this.props.onlyFirst) {
      return (
        <React.Fragment>
          {this.renderItems([displayOrder[0]])}
          <hr style={styles.hr} />
        </React.Fragment>
      );
    }
    const displayItems = Object.keys(displayOrder)
      .filter(seq => !pageIsACorp || displayOrder[seq].includeForCorp)
      .sort()
      .map(seq => displayOrder[seq]);
    return this.renderItems(displayItems);
  }
}

TabsHeader.propTypes = propTypes;
TabsHeader.defaultProps = defaultProps;

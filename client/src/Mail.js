import React from 'react';
import PropTypes from 'prop-types';
import FetchData from './FetchData';
import TableStyles from './TableStyles';

const propTypes = {
  alt: PropTypes.string,
  mailList: PropTypes.array,
};

const defaultProps = {
};

const styles = {
  ...TableStyles.styles,
  isRead: {
    fontWeight: 'normal',
  },
  isUnread: {
    fontWeight: 'bold',
  },
  body: {
    textAlign: 'left',
    color: 'white',
    fontStyle: 'italic',
    a: { color: 'white' },
    paddingLeft: '60px',
    colSpan: 3,
  },
}

export default class Mail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'mail',
      mailList: [],
    };
  }

  static jsonToMailList(json) {
    let list = [];
    if (json) {
      for (let we in json) {
        list.push(json[we]);
      }
    }
    return list;
  }

  componentDidMount() {
    let newList;

    new FetchData(
      { id: this.props.alt, scope: 'mail' },
    ).get()
      .then(data => {
        return newList = Mail.jsonToMailList(data.info);
      })
      .then(() => {
        if (newList.length !== (this.state.mailList || []).length) {
          const updatedList = [];
          newList.map(item => {
            updatedList.push({ ...item, collapsed: true });
          })
          const sortedMailList = updatedList.sort((a,b) => (new Date(b.timestamp) - new Date(a.timestamp)))
          this.setState({ mailList: sortedMailList })
        }
      })
      .catch((err) => {
        console.error(err);
      })
  }

  badlyRemoveFontSizeColor(html) {
    let small = html.replace(/<font size=['"]\d*['"]/g, '<font size="unset"');
    small = small.replace(/color=['"]#?[0-9a-zA-Z]*['"]/g, 'color="white"');
    small = small.replace(/<a /g, '<a style="color: cyan"');
    return small + '<hr/>';
  }

  findLinks(data, linksList) {
    let regexp = /showinfo:(\d+)\/\/(\d+)">([\w\s]+)</g
    let body = this.badlyRemoveFontSizeColor(data.info);
    let matches;
    // eslint-disable-next-line no-cond-assign
    while(matches = regexp.exec(body)){
      linksList.push({ param1: matches[1], param2: matches[2] });
    }
    if (linksList.length === 0){
      return null;
    }
    let encodedList = encodeURIComponent(JSON.stringify(linksList));
    return new FetchData({ scope: 'linkID', id: this.props.alt, param1: encodedList }).get();
  }

  processLinks(links, body){
    if (!links){
      return body;
    };
    let markup;
    Object.keys(links).forEach(id => {
      let lookupRegex = new RegExp(`${id}">([\\w\\s]+)<`, 'g');
      if ('type' in (links[id] || {})){
        if (links[id].type === 'character'){
          markup = `${links[id].corporation_id.ticker}`;
          markup += links[id].alliance_id ? ` / ${links[id].alliance_id.ticker}` : '';
        }
      } else {
        markup = links[id].solarSystemName;
      };
      body = body.replace(lookupRegex, `${id}">$1 [${markup}]<`);
    });
    return body;
  }

  toggleMessage = (idx) => {
    let linksList = [];
    let { mailList } = this.state;
    let thisMail = mailList[idx];
    let body;
    this.setState({ mailList: { ...mailList, [idx]: { ...thisMail, collapsed: !thisMail.collapsed } } });
    if (!thisMail.body) {
      return new FetchData(
        { id: this.props.alt, scope: 'mail', param1: thisMail.mail_id },
      ).get()
        .then(data => this.findLinks(data, linksList))
        .then(links => this.processLinks(links, body))
        .then((body) => {
          this.setState({ mailList: { ...mailList, [idx]: { ...thisMail, collapsed: false, body } } });
        })
    }
  };


  mailItem(key, { timestamp, from, subject, is_read }) {
    console.log(`from ${from}`);
    let lineStyle, formattedDate;
    let readStyle = is_read ? styles.isRead : styles.isUnread;

    lineStyle = (key % 2 === 0 ? styles.isOdd : {});
    lineStyle = { ...lineStyle, ...readStyle, ...styles.cell };
    let newdate = new Date(timestamp);
    formattedDate = newdate.toLocaleDateString() + ' ' + newdate.toLocaleTimeString();
    return (
      <div key={key} style={styles.row} onClick={() => this.toggleMessage(key)}>
        <div style={lineStyle}>{formattedDate}</div>
        <div style={lineStyle}>{from ? from.name : null}</div>
        <div style={lineStyle}>{subject}</div>
      </div>
    );
  }

  mailBody = (line) => {
    return (
      !this.state.mailList[line].collapsed &&
      (<div style={styles.row}>
        <div
          style={{ ...styles.cell, ...styles.body }}
          dangerouslySetInnerHTML={{ __html: this.state.mailList[line].body }}
        />
      </div>
      )
    )
  }

  render() {
    return (
      <div style={styles.table}>
        <div style={styles.header}>
          <div style={styles.cell}>DATE</div>
          <div style={styles.cell}>FROM</div>
          <div style={styles.cell}>SUBJECT</div>
        </div>
        {Object.keys(this.state.mailList).map((line, idx) => {
          return (
            <React.Fragment>
              {this.mailItem(idx, this.state.mailList[line])}
              {this.mailBody(line)}
            </React.Fragment>
          );
        })
        }
      </div>
    )
  }
}

Mail.propTypes = propTypes;
Mail.defaultProps = defaultProps;
import React from 'react';
import PropTypes from 'prop-types';
import Loader from 'react-loader-spinner';
import FetchData from './common/FetchData';
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
    width: '120%',
  },
}

export default class Mail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      scope: 'mail',
      mailList: [],
      loading: true,
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

    // get the mail headers by API
    new FetchData(
      { id: this.props.alt, scope: 'mail' },
    ).get()
      .then(data => {
        // got the list of mail headers
        return newList = Mail.jsonToMailList(data);
      })
      .then(() => {
        if (newList.length !== (this.state.mailList || []).length) {
          const updatedList = [];
          newList.forEach(item => {
            updatedList.push({ ...item, collapsed: true });
          })
          const sortedMailList = updatedList.sort((a,b) => (new Date(b.timestamp) - new Date(a.timestamp)))
          this.setState({ mailList: sortedMailList, loading: false })
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

  findLinks(body, linksList) {
    /* Trawl through the body for CCP links
     *  These are of the form showinfo:<typeId>//<itemId>
     *  Then fetch the text from the API for each of them
     */
    let regexp = /showinfo:(\d+)\/\/(\d+)">([\w\s]+)</g
    let matches;
    // eslint-disable-next-line no-cond-assign
    while(matches = regexp.exec(body)){
      linksList.push({ typeId: matches[1], itemId: matches[2] });
    }
    if (linksList.length === 0){
      return null;
    }
    let encodedList = encodeURIComponent(JSON.stringify(linksList));
    return new FetchData({ scope: 'link', id: this.props.alt, param1: encodedList }).get();
  }

  processLinks(links, body){
    /* Given a list of text values for links, from this.findLinks(),
     *  replace the links with the text
     */
    if (!links){
      return body;
    };
    let markup;
    links.forEach(link => {
      let lookupRegex = new RegExp(`${link.itemId}">([\\w\\s]+)<`, 'g');
      if ('type' in (link || {})){
        if (link.type === 'character'){
          markup = `${link.data.corporation_ticker}`;
          markup += link.data.alliance_ticker ? ` / ${link.data.alliance_ticker}` : '';
        }
      } else {
        markup = link.data.solarSystemName;
      };
      body = body.replace(lookupRegex, `${link.itemId}">$1 [${markup}]<`);
    });
    return body;
  }

  toggleMessage = (idx) => {
    // toggle message body visibility, loading if needed
    let linksList = [];
    let { mailList } = this.state;
    let thisMail = mailList[idx];
    let rawBody;
    const updatedMailList = mailList.slice(0);
    updatedMailList[idx] = { ...thisMail, collapsed: !thisMail.collapsed };
    this.setState({ mailList: updatedMailList });
    if (!thisMail.body) {
      return new FetchData(
        { id: this.props.alt, scope: 'mail', param1: thisMail.mail_id },
      ).get()
        .then((body) => {
          rawBody = this.badlyRemoveFontSizeColor(body);
          this.findLinks(rawBody, linksList)
        })
        .then(links => this.processLinks(links, rawBody))
        .then((body) => {
          const updatedMailList = mailList.slice(0);
          updatedMailList[idx] = { ...thisMail, collapsed: false, body };
          this.setState({ mailList: updatedMailList });
        })
    }
  };


  mailItem(key, { timestamp, from, subject, is_read }) {
    // a react item
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
          style={styles.body }
          dangerouslySetInnerHTML={{ __html: this.state.mailList[line].body }}
        />
      </div>
      )
    )
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
    return (
      <div style={styles.table}>
        <div style={styles.header}>
          <div style={styles.cell}>DATE</div>
          <div style={styles.cell}>FROM</div>
          <div style={styles.cell}>SUBJECT</div>
        </div>
        {Object.keys(this.state.mailList).map((line, idx) => {
          return (
            < >
              {this.mailItem(idx, this.state.mailList[line])}
              {this.mailBody(line)}
            </>
          );
        })
        }
      </div>
    )
  }
}

Mail.propTypes = propTypes;
Mail.defaultProps = defaultProps;
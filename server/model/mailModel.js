const esi = require('eve-swagger');
const Character = require('./CharacterModel');
const logging = require('../src/Logging');

class MailModel {
  constructor() {
    this.userList = {};
  }

  idToName(id) {
    const char = new Character();
    return char
      .get(id)
      .then((charData) => {
        this.userList[id] = charData.name;
      })
      .catch((err) => {
        logging.error(`idToName error ${err.message}`);
      });
  }

  getMailList(userId, token) {
    const nUserId = parseInt(userId, 10);
    return esi.characters(nUserId, token).mail().then((msgList) => {
      try {
      // load the names
      // 1st pass, get id->names mapping
        this.userList = {
          [nUserId]: 'Me',
        };

        // pass 1 - get list of ids
        msgList.forEach((msg) => {
          msg.recipients
            .map(recipient => recipient.recipient_id)
            .forEach((id) => {
              this.userList[id] = '';
            });
        });

        return Promise.all(Object.keys(this.userList).map(id => this.idToName(id)))
          .then(() => msgList.map(msg => ({
            ...msg,
            from: { id: msg.from, name: this.userList[msg.from] },
            recipients: msg.recipients.map(recipient => ({
              name: this.userList[recipient.recipient_id],
            })),
          })));
      } catch (err) {
        logging.error(`GetMailList ${err.message}`);
        return {};
      }
    });
  }

  static async getMailBody(userId, accessToken, mailId) {
    try {
      return await esi
        .characters(parseInt(userId, 10), accessToken)
        .mail(parseInt(mailId, 10))
        .info();
    } catch (err) {
      logging.error(`getMailBody ${err.message}`);
      return {};
    }
  }
}

const instance = new MailModel();

module.exports = instance;

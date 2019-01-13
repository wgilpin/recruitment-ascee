const Esi = require('../src/EsiRequest');

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
    // TODO: esi.characters is not a function
    return Esi.get(Esi.kinds.MailHeaders, nUserId, token).then((data) => {
      const msgList = data.body;
      try {
      // load the names
      // 1st pass, get id->names mapping
        this.userList = {
          [nUserId]: 'Me',
        };

        // pass 1 - get list of ids
        msgList.forEach((msg) => {
          this.userList[msg.from] = '';
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

  /* eslint-disable class-methods-use-this */
  async getMailBody(userId, mailId, accessToken) {
    try {
      return Esi.get(
        Esi.kinds.MailBody,
        parseInt(userId, 10),
        accessToken,
        parseInt(mailId, 10),
      )
        .then((data) => {
          console.log(`mail body ${data}`);
          return data.body;
        });
    } catch (err) {
      logging.error(`getMailBody ${err.message}`);
      return {};
    }
  }
}

const instance = new MailModel();

module.exports = instance;

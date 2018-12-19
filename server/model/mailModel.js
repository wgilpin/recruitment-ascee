const esi = require('eve-swagger');
const Character = require('./CharacterModel');

const memCacheUsers = {};

class MailModel {
  static async getCharNameFromCache(id) {
    if (id in memCacheUsers) {
      return memCacheUsers[id];
    }
    const user = await Character.get(id);
    if (user.name) {
      memCacheUsers[id] = user.name;
    }
    return user.name;
  }

  static async getMailList(userId, token) {
    let mail;
    try {
      mail = await esi.characters(parseInt(userId, 10), token).mail();
    } catch (err) {
      console.error(err.message);
      return {};
    }
    // load the names
    // eslint-disable-next-line no-restricted-syntax
    for (const msg of mail) {
      if (msg.from === userId) {
        msg.from = 'Me';
        // eslint-disable-next-line no-restricted-syntax
        for (const recipient of msg.recipients) {
          recipient.to = await Character.get(recipient.recipient_id).name;
        }
      } else {
        msg.to = 'Me';
        msg.from = await Character.get(msg.from).name;
      }
    }
    return mail;
  }

  static async getMailBody(userId, accessToken, mailId) {
    try {
      return await esi
        .characters(parseInt(userId, 10), accessToken)
        .mail(parseInt(mailId, 10))
        .info();
    } catch (err) {
      console.error(err.message);
      return {};
    }
  }
}

module.exports = MailModel;

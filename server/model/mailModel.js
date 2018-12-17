const esi = require('eve-swagger');
const Character = require('./CharacterModel');

class mailModel {
  static async getMailList(userId, token) {
    let mail;
    try {
      mail = await esi.characters(parseInt(userId, 10), token).mail();
    } catch (err) {
      console.error(err);
    }
    // Mail(esi, userId, token);
    // .Mail.inbox();
    const memCacheUsers = {};
    // load the names
    // eslint-disable-next-line no-restricted-syntax
    for (const msg of mail) {
      if (msg.from === userId) {
        msg.from = 'Me';
        // eslint-disable-next-line no-restricted-syntax
        for (const recipient of msg.recipients) {
          if (recipient.recipient_id in memCacheUsers) {
            recipient.to = memCacheUsers[recipient.recipient_id];
          } else {
            const to = new Character();
            await to.get(recipient.recipient_id);
            if (to.values.name) {
              memCacheUsers[recipient.recipient_id] = to.values.name;
            }
            recipient.to = to.values.name;
          }
        }
      } else {
        msg.to = 'Me';
        if (msg.from in memCacheUsers) {
          msg.from = memCacheUsers[msg.from];
        } else {
          const from = new Character();
          await from.get(msg.from);
          if (from.values.name) {
            memCacheUsers[msg.from] = from.values.name;
          }
          msg.from = from.values.name;
        }
      }
    }
    return mail;
  }
}

module.exports = mailModel;

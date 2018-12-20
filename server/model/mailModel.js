const esi = require('eve-swagger');
const Character = require('./CharacterModel');

class MailModel {
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
          const char = new Character();
          await char.get(recipient.recipient_id);
          recipient.to = char.values.name;
        }
      } else {
        msg.to = 'Me';
        const char = new Character();
        await char.get(msg.from);
        msg.from = char.values.name;
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

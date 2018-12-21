const Store = require('../model/Store');
const Oauth = require('./Oauth');

class TokenStore {
  /*
    in-memory cache for users tokens, with auto refresh
  */
  constructor() {
    this.tokens = {};
  }

  add(userId, refreshToken, accessToken, expires) {
    // put in store
    this.tokens[userId] = { expires, accessToken, rt: refreshToken };
  }

  async get(kind, userId) {
    /*
     * get token from the cache, update it if needed *
     * @param {string} kind - datastore entity kind
     * @param {string} userId - datastore key id
     * @returns {string} access token
     */
    let expires;
    let refreshToken;
    let accessToken;
    if (userId in this.tokens && this.tokens[userId].refreshToken) {
      ({ expires, refreshToken, accessToken } = this.tokens[userId]);
      if (new Date() < expires) {
        // the token is still valid
        return accessToken;
      }
    } else {
      console.log(`Token Expired for ${userId}`);
      this.tokens[userId] = {};
      this.key = Store.datastore.key({ path: [kind, parseInt(userId, 10)] });
      let dbEntity;
      try {
        // get refresh token from db
        [dbEntity] = await Store.datastore.get(this.key);
        if (dbEntity) {
          ({ refreshToken } = dbEntity);
          this.tokens[userId].refreshToken = refreshToken;
        }
      } catch (err) {
        console.log(`datastore token not found: ${err}`);
        return false;
      }
    }
    // token expired or not found in DB
    try {
      /* eslint-disable camelcase */
      const { access_token, expires_in } = await Oauth.refreshToken(refreshToken);
      this.tokens[userId].accessToken = access_token;
      const now = new Date();
      const expirationTime = now.setSeconds(now.getSeconds() + expires_in);
      this.tokens[userId].expires = expirationTime;
      return access_token;
    } catch (err) {
      console.log(`TokenStore ${err.message}`);
      return null;
    }
  }
}

const instance = new TokenStore();

module.exports = instance;

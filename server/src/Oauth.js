const SSO = require('eve-singlesignon');
const configFile = require('../config');
const logging = require('./Logging');

const config = configFile.get(process.env.NODE_ENV);

// eve-singlesignon is an eve auth library
// https://github.com/MichielvdVelde/eve-singlesignon

// Create a new instance with the set parameters
const sso = new SSO.SingleSignOn(
  config.client.CLIENT_ID,
  config.client.SECRET_KEY,
  config.client.CALLBACK_URL,
);

class Oauth {
  // as we have refresh tokens, this gets the access token
  static async getAccessToken(code, state) {
    try {
      // eve sso lib gets us an access token given the access code
      const result = await sso.getAccessToken(code);
      /* eslint-disable camelcase */
      const { access_token, refresh_token, expires_in } = result;
      const now = new Date();
      const expirationTime = now.setSeconds(now.getSeconds() + expires_in);
      const { CharacterName, CharacterID } = await sso.verifyAccessToken(access_token);
      /* note the state token we supplied to the eve oauth via the url is in two parts:
       *    either 'main:' or 'alt:'
       *    then a random string
       * main for when this was a main char login (eg from the homepage)
       * alt for an alt - eg when applicant clicks 'add alt'
       * We need to know so we can redirect the user to the right but of the app after
       */
      const res = {
        name: CharacterName,
        userId: CharacterID,
        expires: expirationTime,
        accessToken: access_token,
        refreshToken: refresh_token,
        loginKind: state.split(':')[0].trim(), // we added 'main' or 'alt to the state. Strip it.
      };
      return res;
    } catch (err) {
      // An error occurred
      logging.error('oauth error', err);
      return null;
    }
  }

  static async refreshToken(refreshToken) {
    // refresh the access token given the refresh token we stored for the char
    const result = await sso.getAccessToken(refreshToken, true);
    logging.debug(`refreshToken ${result.access_token}`);
    return result;
  }
}

module.exports = Oauth;

const SSO = require('eve-singlesignon');

const CLIENT_ID = '37de4bba039744c0a4d59cc15c9748c2';
const SECRET_KEY = 'O0q1KdspI0QRNlpX3nlSgXIGn0WJ9DOxxqj1bHrv';
const CALLBACK_URL = 'https://ascee-recruit.appspot.com/oauth-callback';

// Create a new instance with the set parameters
const sso = new SSO.SingleSignOn(CLIENT_ID, SECRET_KEY, CALLBACK_URL);

class Oauth {
  // as we have refresh tokens, this gets the access token
  static async getAccessToken(code, state) {
    try {
      const result = await sso.getAccessToken(code);
      /* eslint-disable camelcase */
      const { access_token, refresh_token, expires_in } = result;
      const now = new Date();
      const expirationTime = now.setSeconds(now.getSeconds() + expires_in);
      const { CharacterName, CharacterID } = await sso.verifyAccessToken(access_token);
      const res = {
        name: CharacterName,
        userId: CharacterID,
        expires: expirationTime,
        accessToken: access_token,
        refreshToken: refresh_token,
        loginKind: state.split(':')[0].trim(),
      };
      return res;
    } catch (err) {
      // An error occurred
      console.error('oauth error', err);
      return null;
    }
  }

  static async refreshToken(refreshToken) {
    // refresh the access token given the refresh
    const result = await sso.getAccessToken(refreshToken, true);
    return result;
  }
}

module.exports = Oauth;

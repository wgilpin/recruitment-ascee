import Mocks from "./Mocks";
import MockContacts from './mocks/MockContacts'
import MockContracts from './mocks/MockContracts'
import configFile from './config';
const config = configFile.get(process.env.NODE_ENV);

export default class FetchData {
  /*
   * fetch() wrapper
   *
   * usage:
   * new FetchData({ id, scope })
   *  .get()
   *  .then(data => {
   *    process(data)
   *  });
  */
  constructor(params, onLoaded, onError) {
    this.params = FetchData.toParams(params);
    this.originalParams = params;
    this.scope = params.scope;
    this.onLoaded = onLoaded;
    this.onError = onError;
  }

  static toParams(obj) {
    let res = [];
    for (let key in obj) {
      res.push(`${key}=${encodeURI(obj[key])}`);
    }
    return res.join('&');
  }

  get() {
    let url = `${config.client.server}/api/${this.scope}/${this.originalParams.id || ''}`;
    if('param1' in this.originalParams){
      url += `/${this.originalParams.param1}`;
    }
    console.log(`fetch ${url}`);
    return fetch(
      //`https://ascee.droeftoeters.com/backend/Pullpages/Evidence.php?${this.params}`,
      url,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
        },
        //mode: 'no-cors',
      })
      .then((res) => {
        // TODO: DEV server only
        if (res.type === "opaque") {
          console.log('opaque');
          // it's a CORS problem so we are on the dev server
          switch (this.scope) {
            case 'mail':
              return this.params.search('param1') === -1 ? Mocks.mockMail : Mocks.mockMailBody;
            case 'linkID':
              return Mocks.mockLink;
            case 'wallet':
              return Mocks.mockWallet;
            case 'skill':
              return Mocks.mockSkills;
            case 'bookmarks':
              return Mocks.mockBookmarks;
            case 'contacts':
              return MockContacts.mock;
              case 'contract':
              return MockContracts.mock;
            default:
              return null;
          }
        };
        return res.json()
      })
      .catch((err) => {
        console.log('fetchData', err)
      });
  }
}
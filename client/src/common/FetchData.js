import Mocks from "./mocks/Mocks";
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

  getMockData(res) {
    console.log('opaque');
    // it's a CORS problem so we are on the dev server
    // return the appropriate mock
    // TODO: all broken by python
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
  }

  get(query_params) {
    let url = `${config.client.server}/api/${this.scope}`;
    if (this.originalParams.id) {
      url += `/${this.originalParams.id || ''}`;
    }
    if('param1' in this.originalParams){
      url += `/${this.originalParams.param1}`;
    }
    if('param2' in this.originalParams){
      url += `/${this.originalParams.param2}`;
    }
    if (query_params){
      url += '?' + Object.keys(query_params).map(key => `${key}=${query_params[key]}`).join('&');
    }
    const tStart = performance.now();
    console.log(`fetch ${url}`);
    return fetch(
      url,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': 'http://localhost:3000',
        },
      })
      .then((res) => {
        const tEnd = performance.now();
        console.log(`Call to ${url} took ${Math.round(tEnd - tStart)}ms`)

        if (res.type === "opaque") {
          return this.getMockData(res);
        };
        console.log(res.status, res.status > 400);
        if (res.status > 400) {
          console.log('error', res.statusText);
          if (res.status === 401){
            console.log('redirect to /login')
            window.location = '/login';
          }
          return ({ 'error': res.statusText, status: res.status })
        }
        return res.json()
      })
      .catch((err) => {
        console.log('fetchData', err)
      });
  }

  put(payload) {
    let url = `${config.client.server}/api/${this.scope}/${this.originalParams.id || ''}`;
    console.log(`fetch post ${url}`);
    return fetch(url, {
      method: 'put',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(payload),
  })
  }
}
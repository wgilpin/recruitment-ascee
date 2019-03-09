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

  buildUrl(queryParams) {
    let url = `${config.client.server}/api/${this.scope}`;
    if (this.originalParams.id) {
      url += `/${this.originalParams.id || ''}`;
    }
    if ('param1' in this.originalParams) {
      url += `/${this.originalParams.param1}`;
    }
    if ('param2' in this.originalParams) {
      url += `/${this.originalParams.param2}`;
    }
    if (queryParams) {
      url +=
        '?' +
        Object.keys(queryParams)
          .map(key => `${key}=${queryParams[key]}`)
          .join('&');
    }
    return url;
  }

  get(query_params) {
    const url = this.buildUrl(query_params);
    const tStart = performance.now();
    console.log(`fetch ${url}`);
    return fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': 'http://localhost:3000',
      },
    })
      .then(res => {
        const tEnd = performance.now();
        console.log(`Call to ${url} took ${Math.round(tEnd - tStart)}ms`);
        console.log(res.status, res.status > 400);
        if (res.status > 400) {
          console.log('error', res.statusText);
          if (res.status === 401) {
            console.log('redirect to /login');
            window.location = '/login';
          }
          return { error: res.statusText, status: res.status };
        }
        return res.json();
      })
      .catch(err => {
        console.log('fetchData', err);
      });
  }

  put(payload) {
    const url = this.buildUrl();
    console.log(`fetch put ${url}`);
    return fetch(url, {
      method: 'put',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).then(response => {
      return response.json();
    });
  }

  delete() {
    const url = this.buildUrl();
    console.log(`fetch delete ${url}`);
    return fetch(url, {
      method: 'delete',
      headers: { 'Content-Type': 'application/json' },
    }).then(response => {
      return response.json();
    });
  }
}

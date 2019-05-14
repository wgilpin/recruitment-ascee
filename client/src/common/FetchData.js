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
        if (res.status >= 400) {
          console.log('error', res.statusText, res.body);
          if (res.status === 401) {
            console.log('redirect to /auth/login');
            window.location = '/auth/login';
          }
          console.log('returning error', res.status);
          return res.json().then(body => ({ error: res.statusText, status: res.status, body }));
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

  post_files(files) {
    const url = this.buildUrl();
    console.log(`fetch put ${url}`);
    return fetch(url, {
      method: 'post',
      headers: { 'Content-Type': 'image' },
      body: files,
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

  upload_to_server = (files, onSent, onError) => {
    var xhr = new XMLHttpRequest();
    let url = `${config.client.server}/api/user/upload_image`;
    xhr.open('POST', url);

    var postData = new FormData();
    files.forEach((file, i) => {
      postData.append(i, file);
    });
    xhr.send(postData);
    xhr.onreadystatechange = e => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          onSent();
        } else {
          onError();
        }
      }
    };
  };
}

/* eslint-disable no-console */

class Logging {
  static timeIfLocal(msg) {
    if (process.platform === 'win32') {
      const d = new Date();
      return `${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}  ${msg}`;
    }
    return msg;
  }

  static log(msg) {
    console.log(Logging.timeIfLocal(`Info: ${msg}`));
  }

  static debug(msg) {
    if (process.platform === 'win32') {
      console.log(Logging.timeIfLocal(`Debug: ${msg}`));
    }
  }

  static error(msg) {
    console.error(Logging.timeIfLocal(`ERROR: ${msg}`));
  }
}

module.exports = Logging;

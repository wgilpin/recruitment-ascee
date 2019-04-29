export default class Misc {
  static commarize(num, min = 1e3) {
    // from https://gist.github.com/MartinMuzatko/1060fe584d17c7b9ca6e
    // Alter numbers larger than 1k
    if (!num) {
      return '0';
    }
    const abs_num = Math.abs(num);
    if (abs_num >= min) {
      const units = ['k', 'M', 'B', 'T'];
      const order = Math.floor(Math.log(abs_num) / Math.log(1000));
      const unitname = units[order - 1];
      let out = Math.round(num / (1000 ** order));
      // output number remainder + unitname
      return out + unitname;
    }
    // return formatted original number
    return num.toLocaleString();
  }

  static dictLen(dict) {
    let count = 0;
    Object.keys(dict).map(key => count += dict.hasOwnProperty(key) ? 1 : 0);
    return count;
  }
}



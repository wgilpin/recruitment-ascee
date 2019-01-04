export default class Misc {
  static commarize(num, min = 1e3) {
    // from https://gist.github.com/MartinMuzatko/1060fe584d17c7b9ca6e
    // Alter numbers larger than 1k
    if (!num) {
      return '0';
    }
    if (num >= min) {
      const units = ['k', 'M', 'B', 'T'];
      const order = Math.floor(Math.log(num) / Math.log(1000));
      const unitname = units[order - 1];
      let out = Math.round(num / (1000 ** order));
      // output number remainder + unitname
      return out + unitname;
    }
    // return formatted original number
    return num.toLocaleString();
  }
}



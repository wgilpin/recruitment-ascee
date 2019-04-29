import Misc from './Misc'


describe('commarize', () => {
  it('returns 0 for 0', () => {
    expect(Misc.commarize(0)).toEqual('0');
  });

  it('returns 0 for undefined', () => {
    expect(Misc.commarize({}.x)).toEqual('0');
  });

  it('shortens numbers above 1k', () => {
    expect(Misc.commarize(1234)).toEqual('1k');
  });

  it('doesnt shorten numbers below threshold', () => {
    expect(Misc.commarize(1234,10000)).toEqual('1,234');
  });

  it('doesnt shorten negative numbers above threshold', () => {
    expect(Misc.commarize(-1234,10000)).toEqual('-1,234');
  });

  it('shortesn negative numbers within threshold', () => {
    expect(Misc.commarize(-1234,1000)).toEqual('-1k');
  });

  it('doesnt shorten negative numbers above threshold', () => {
    expect(Misc.commarize(-1234,10000)).toEqual('-1,234');
  });
})

describe('dictlen', () => {
  it('returns 0 for empty object', () => {
    expect(Misc.dictLen({})).toEqual(0);
  });

  it('returns object key count ', () => {
    expect(Misc.dictLen({a: 1, b: 2})).toEqual(2);
  });

  it('doesnt count nested dicts ', () => {
    expect(Misc.dictLen({a: 1, b: {c: 3, d: 4}})).toEqual(2);
  });
})
// export default class Misc {
//   static commarize(num, min = 1e3) {
//     // from https://gist.github.com/MartinMuzatko/1060fe584d17c7b9ca6e
//     // Alter numbers larger than 1k
//     if (!num) {
//       return '0';
//     }
//     if (num >= min) {
//       const units = ['k', 'M', 'B', 'T'];
//       const order = Math.floor(Math.log(num) / Math.log(1000));
//       const unitname = units[order - 1];
//       let out = Math.round(num / (1000 ** order));
//       // output number remainder + unitname
//       return out + unitname;
//     }
//     // return formatted original number
//     return num.toLocaleString();
//   }

//   static dictLen(dict) {
//     let count = 0;
//     Object.keys(dict).map(key => count += dict.hasOwnProperty(key) ? 1 : 0);
//     return count;
//   }
// }



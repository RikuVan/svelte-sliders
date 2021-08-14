/**
 * // this is a slightly adapted and fixed version of https://github.com/vercel/ms
  
// string => number
  parse('2 days');   //=> 172800000
  parse('1d');       //=> 86400000
  parse('10h');      //=> 36000000
  parse('2.5 hrs');  //=> 9000000
  parse('2h');       //=> 7200000
  parse('1m');       //=> 60000
  parse('5s');       //=> 5000
  parse('1y');       //=> 31557600000
  parse('100');      //=> 100
  parse('-3 days');  //=> -259200000
  parse('-1h');      //=> -3600000
  parse('-200');     //=> -200

 */

const RGX =
        /^(-?(?:\d+)?\.?\d+) *(m(?:illiseconds?|s(?:ecs?)?))?(s(?:ec(?:onds?|s)?)?)?(m(?:in(?:utes?|s)?)?)?(h(?:ours?|rs?)?)?(d(?:ays?)?)?(w(?:eeks?|ks?)?)?(y(?:ears?|rs?)?)?$/,
    SEC = 1e3,
    MIN = SEC * 60,
    HOUR = MIN * 60,
    DAY = HOUR * 24,
    YEAR = DAY * 365.25;

/**
 * parses string to milliseconds
 * @param {string} val
 * @returns {number}
 */
export function parse(val) {
    let num;
    const arr = val.toLowerCase().match(RGX);
    if (arr != null && (num = parseFloat(arr[1]))) {
        if (arr[3] != null) return num * SEC;
        if (arr[4] != null) return num * MIN;
        if (arr[5] != null) return num * HOUR;
        if (arr[6] != null) return num * DAY;
        if (arr[7] != null) return num * DAY * 7;
        if (arr[8] != null) return num * YEAR;
        return num;
    }
    console.error('Unable to parse', val);
    return undefined;
}

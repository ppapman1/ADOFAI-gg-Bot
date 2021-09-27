import { flatParse } from "./util";

console.log(flatParse('{"text":"hello world!","color":"red","bold":"true","extra":[{"text":"red"}]}'))
console.log(flatParse('{"asdsad":42314,"ds":{"dsd":"fd","322":-2344,"water":null,"bad":{"apple":"is good","woow":""}},"wow":{"sans":"asinunguna"}}'))
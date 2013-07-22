var should = require('should');

// console.log($equals([1,2,3,4], [1,2,3,4], -1));
// console.log($equals([[1,2,3],2,3,4], [2,[1,2,3],3,4], -1));
// console.log($equals([{x:1,y:[1,2,3]},2,3,4], [2,3,{x:1,y:[1,2,3]},4], -1));
// console.log(JSON.stringify($equals({
//   a:1,
//   b:[2,3,4],
//   c:["3","4","5"],
//   d:[
//     {
//       x:1,
//       y:"123"
//     }
//   ],
//   e:[]
// }, {
//   a:1,
//   b:undefined,
//   c:["4","3"],
//   d:[{
//       y:"123",
//       x:1
//     }, {
//       x:2,
//       y:"123"
//     }
//   ],
//   e:[1,2,3,4]
// }, -1), null, 2));

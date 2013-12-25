// describe('mongo-ext.js', function() {
//  it('should load proper', function() {
//    require('../mongo-ext.js');
//    $diff.should.be.an.instanceof(Function);
//    $equals.should.be.an.instanceof(Function);
//  });
// });

require('../');

describe('$define', function() {
  var obj = $define({}, {
    a: 1,
    get x() { return this.a; },
    set x(v) { this.a = v; }
  });
  it('properties should be non-enumerable', function() {
    Object.isEmpty(obj).should.be.ok;
  });
  it('properties should be non-configurable', function() {
    (delete obj.a).should.not.be.ok;
  });
  it('getter and setter should works', function() {
    obj.x.should.eql(1);
    obj.x = 15;
    obj.a.should.eql(15);
    obj.x.should.eql(15);
  });
});
describe('$extend', function() {
  var objects = {
    get lhv() {
      return {
        age: 73,
        name: {
          first: 'John',
          last: 'Lewis'
        },
        sex: {
          male: 1,
          female: 0
        },
        country: 'us'
      };
    },
    get rhv() {
      return {
        age: 74,
        name: 'John Lewis',
        sex: {
          male: 1,
          secret: 0
        },
        born: 1940
      };
    },
    get 0() {
      return {
        age: 73,
        name: {
          first: 'John',
          last: 'Lewis'
        },
        sex: {
          male: 1,
          female: 0
        },
        country: 'us',
        born: 1940
      };
    },
    get 1() {
      return {
        age: 74,
        name: 'John Lewis',
        sex: {
          male: 1,
          secret: 0
        },
        born: 1940,
        country: 'us'
      };
    },
    get 2() {
      return objects[0];
    },
    get 3() {
      return {
        age: 73,
        name: 'John Lewis',
        sex: {
          male: 1,
          female: 0,
          secret: 0
        },
        country: 'us',
        born: 1940
      };
    }
  };
  it('should extend without override', function() {

  });
  it('should extend with override, no deep', function() {

  });
  it('should not extend deep if without override', function() {

  });
  it('should extend deep if with override', function() {

  });
});
describe('$typeof', function () {
  it('should return array', function () {
    $typeof([]).should.eql('array');
  });
  it('should return function', function() {
    $typeof(function() {}).should.eql('function');
  });
  it('should return number', function() {
    $typeof(0).should.eql('number');
  });
  it('should return object', function () {
    $typeof({}).should.eql('object');
  });
  it('should return regexp', function() {
    $typeof(/regexp/).should.eql('regexp');
  });
  it('should return string', function () {
    $typeof('').should.eql('string');
  });
  it('should return object', function () {
    var Ctor = function() {};
    $typeof(new Ctor()).should.eql('object');
  });
});
describe('Array', function() {
  describe('flatten', function() {
    it('should flatten [1, [2, 3], 4] as [1, 2, 3, 4]', function() {
      [1, [2, 3], 4].flatten().should.eql([1, 2, 3, 4]);
    });
    it('should flatten [1, [2, 3, [4]]] as [1, 2, 3, [4]]', function() {
      [1, [2, 3, [4]]].flatten().should.eql([1, 2, 3, [4]]);
    });
    it('should deep flatten [1, [2, [3, [4]]]] as [1, 2, 3, 4]', function() {
      [1, [2, [3, [4]]]].flatten(true).should.eql([1, 2, 3, 4]);
    });
  });
  describe('rotate', function() {
    it('should rotate [1,2,3,4,5] by -1 as [5,1,2,3,4]', function() {
      [1, 2, 3, 4, 5].rotate(-1).should.eql([5, 1, 2, 3, 4]);
    });
    it('should rotate [1,2,3,4,5] by 1 as [2,3,4,5,1]', function() {
      [1, 2, 3, 4, 5].rotate(1).should.eql([2, 3, 4, 5, 1]);
    });
    it('should rotate [1,2,3,4,5] by 2 as [3,4,5,1,2]', function() {
      [1, 2, 3, 4, 5].rotate(2).should.eql([3, 4, 5, 1, 2]);
    });
    it('should rotate [1,2,3,4,5] by 3 as [4,5,1,2,3]', function() {
      [1, 2, 3, 4, 5].rotate(3).should.eql([4, 5, 1, 2, 3]);
    });
    it('should rotate [1,2,3,4,5] by 4 as [5,1,2,3,4]', function() {
      [1, 2, 3, 4, 5].rotate(4).should.eql([5, 1, 2, 3, 4]);
    });
    it('should rotate [1,2,3,4,5] by 0 as [1,2,3,4,5]', function() {
      [1, 2, 3, 4, 5].rotate(0).should.eql([1, 2, 3, 4, 5]);
    });
    it('should rotate [1,2,3,4] by 1 as [2,3,4,1]', function() {
      [1, 2, 3, 4].rotate(1).should.eql([2, 3, 4, 1]);
    });
    it('should rotate [1,2,3,4] by 2 as [3,4,1,2]', function() {
      [1, 2, 3, 4].rotate(2).should.eql([3, 4, 1, 2]);
    });
    it('should rotate [1] by 0 as [1]', function() {
      [1].rotate(0).should.eql([1]);
    });
  });
  describe('unique', function () {
    it('should return [1,3,2] after unique [1,3,2,3,2,1]', function () {
      [1,3,2,3,2,1].unique().should.eql([1,3,2]);
    });
    it('should return [] after unique []', function () {
      [].unique().should.eql([]);
    });
    it('should return [1] after unique [1, "1"]', function () {
      [1, "1"].unique().should.eql([1]);
    });
  });
});

describe('String', function() {
  describe('startsWith', function() {
    it('should be able to determin if A starts with B', function() {
      'a'.startsWith('').should.be.ok;
      'a'.startsWith(null).should.be.ok;
      'a'.startsWith().should.be.ok;
      ''.startsWith('').should.be.ok;
      ''.startsWith(null).should.be.ok;
      ''.startsWith().should.be.ok;
      'ab'.startsWith('ab').should.be.ok;
      'a'.startsWith('b').should.not.be.ok;
      'ab'.startsWith('b').should.not.be.ok;
    });
  });
  describe('endsWith', function() {
    it('should be able to determin if A ends with B', function() {
      'a'.endsWith('').should.be.ok;
      'a'.endsWith(null).should.be.ok;
      'a'.endsWith().should.be.ok;
      ''.endsWith('').should.be.ok;
      ''.endsWith(null).should.be.ok;
      ''.endsWith().should.be.ok;
      'ab'.endsWith('ab').should.be.ok;
      'a'.endsWith('b').should.not.be.ok;
      'ab'.endsWith('b').should.be.ok;
    });
  });
  describe('toTitleCase', function() {
    it('should return correct title case form of A', function() {
      'a'.toTitleCase().should.eql('A');
      ''.toTitleCase().should.eql('');
      'ab'.toTitleCase().should.eql('Ab');
      'abc'.toTitleCase().should.eql('Abc');
      'abc a def'.toTitleCase().should.eql('Abc A Def');
      'abc a def  '.toTitleCase().should.eql('Abc A Def  ');
      '  abc def  '.toTitleCase().should.eql('  Abc Def  ');
      'abc def\'s'.toTitleCase().should.eql('Abc Def\'s');
      'abc dEef'.toTitleCase().should.eql('Abc dEef');
      'abc Def'.toTitleCase().should.eql('Abc Def');
      'abc DEF'.toTitleCase().should.eql('Abc DEF');
    });
  });
});

describe('Number', function() {
  describe('clamp', function() {
    it('should be able to clamp a number to the given range', function() {
      (15).clamp(1, 10).should.eql(10);
      (10).clamp(1, 10).should.eql(10);
      (1).clamp(1, 10).should.eql(1);
      (-10).clamp(1, 10).should.eql(1);
    });
  });
  describe('floor and ceil', function() {
    it('should be able to return the floor and ceil of the number', function() {
      (2-1e-8).floor().should.eql(1);
      (2-1e-8).ceil().should.eql(2);
      (1).floor().should.eql(1);
      (2).ceil().should.eql(2);
    });
  });
  describe('round', function() {
    it('should round the number', function() {
      (1.4).round().should.eql(1);
      (1.5).round().should.eql(2);
      (1.5).round(1).should.eql(1.5);
      (1.45).round(1).should.eql(1.5);
    });
  });
  describe('toGroup', function() {
    it('should return the thousands separated number', function() {
      (1).toGroup().should.eql('1');
      (12).toGroup().should.eql('12');
      (123).toGroup().should.eql('123');
      (1234).toGroup().should.eql('1,234');
      (12345).toGroup().should.eql('12,345');
      (123456).toGroup().should.eql('123,456');
      (1234567).toGroup().should.eql('1,234,567');
      (12345678).toGroup().should.eql('12,345,678');
      (123456789).toGroup().should.eql('123,456,789');
      (1234567890).toGroup().should.eql('1,234,567,890');
      (1234567890.123).toGroup(3).should.eql('1,234,567,890.123');
      (1234567890.123).toGroup(3, 'a').should.eql('1a234a567a890.123');
    });
  });
});
describe('Object', function() {
  describe('project', function() {
    var sample = {
      x0: 0,
      x1: 1,
      x2: 2,
      x: {
        xx0: 0,
        xx1: 1,
        xx2: 2,
        xx: {
          xxx0: 0,
          xxx1: 1,
          xxx2: undefined
        }
      }
    };
    it('should project the object to the target shallow', function() {
      Object.project(sample, {
        x: {
          xx0: 1
        }
      }).should.eql({
        x: sample.x
      });
    });
    it('should project the object to the target deep', function() {
      Object.project(sample, {
        x: {
          xx0: 1
        }
      }, true).should.eql({
        x: {
          xx0: 0
        }
      });
    });
    it('should project the object to the target deep & multi', function() {
      Object.project(sample, {
        x: {
          xx: {
            xxx0: 1
          },
          xx1: 1
        }
      }, true).should.eql({
        x: {
          xx: {
            xxx0: 0
          },
          xx1: 1
        }
      });
    });
    it ('should remove undefined field', function() {
      Object.project(sample, {
        x: {
          xx: {
            xxx2: 1
          }
        }
      }, true).should.eql({
        x: {
          xx: {}
        }
      });
    });
    it ('should keep undefined field', function() {
      Object.project(sample, {
        x: {
          xx: {
            xxx2: 1
          }
        }
      }, true, true).should.eql({
        x: {
          xx: {
            xxx2: undefined
          }
        }
      });
    });
    it ('should throw, as do not support flatten key', function() {
      Object.project(sample, {
        'x.xx1': 1
      }, true).should.eql({
        x: {
          xx1: 1
        }
      });
    });
    it ('should throw, as do not support revert mode', function() {
      Object.project(sample, {
        x: 0
      }).should.eql({
        x0: 0,
        x1: 1,
        x2: 2
      });
    });
  });
  describe('Transformer', function () {
    it('should transform object', function () {
      var transformer = new Object.Transformer({
        name: true,
        'good.morning': '.name',
        good: {
          evening: '.name'
        },
        upperCase: function(el) {return el.name.toUpperCase();}
      });
      transformer.exec({
        name: 'yan'
      }).should.eql({
        name: 'yan',
        upperCase: 'YAN',
        'good.morning': 'yan',
        good: {
          evening: 'yan'
        }
      });
    });
  });
});

// describe('mongo-ext.js', function() {
//  it('should load proper', function() {
//    require('../mongo-ext.js');
//    $diff.should.be.an.instanceof(Function);
//    $equals.should.be.an.instanceof(Function);
//  });
// });

require('../');

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
});

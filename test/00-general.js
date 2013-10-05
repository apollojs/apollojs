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

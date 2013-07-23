describe('mongo-ext.js', function() {
	it('should load proper', function() {
		require('../mongo-ext.js');
		$diff.should.be.an.instanceof(Function);
		$equals.should.be.an.instanceof(Function);
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
});

describe('mongo-ext.js', function() {
	it('should load proper', function() {
		require('../mongo-ext.js');
		$diff.should.be.an.instanceof(Function);
		$equals.should.be.an.instanceof(Function);
	});
});

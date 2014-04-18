%.js: %.pjs
	cpp -P -C -w -undef -Ibower_components $(OPTIONS) $< > $@

all: index.js

clean:
	$(RM) -f index.js

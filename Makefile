%.js: %.pjs
	cpp -P -C -w -undef -Ibower_components $(OPTIONS) $< > $@

.PHONY: all clean client

all: client
client: client.js

clean:
	$(RM) -f *.js

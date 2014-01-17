BROWSERIFY ?= ./node_modules/.bin/browserify

all: public/js/bundle.js

public/js/bundle.js: scripts/main.js
	$(BROWSERIFY) $< -o $@

.PHONY: all

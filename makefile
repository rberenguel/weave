ifeq ($(origin .RECIPEPREFIX), undefined)
	$(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >
.ONESHELL: #

build/om_js:
> gsed -e '/main.js/ {r src/main.js' -e 'd}' src/om.html > build/om_js

build/om_js_css: build/om_js
> gsed -e '/style.css/ {r src/style.css' -e 'd}' build/om_js > build/om_js_css

dist/om.html: build/om_js_css
> cp build/om_js_css dist/om.html

all: dist/om.html
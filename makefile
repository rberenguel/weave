ifeq ($(origin .RECIPEPREFIX), undefined)
	$(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >
.ONESHELL: #

# TODO(me) fix sed/gsed

all: dist/weave.html

serve: all
> echo "http://127.0.0.1:8000/dist/weave.html"
> python3 -m http.server 8000

build/main_js: src/*.js
> gsed -e '/.. highlight.js/ {r src/highlight.js' -e 'd}' src/main.js > build/m1
> gsed -e '/.. load.js/ {r src/load.js' -e 'd}' build/m1 > build/m2
> gsed -e '/.. commands.js/ {r src/commands.js' -e 'd}' build/m2 > build/main_js

build/weave_html: src/weave.html src/reforma.css src/monoid.css
> gsed -e '/->reforma.css/ {r src/reforma.css' -e 'd}' src/weave.html > build/o1
> gsed -e '/->monoid.css/ {r src/monoid.css' -e 'd}' build/o1 > build/weave_html

build/weave_js: build/main_js build/weave_html
> gsed -e '/->main.js/ {r build/main_js' -e 'd}' build/weave_html > build/weave_js

build/weave_js_css: build/weave_js src/style.css
> gsed -e '/style.css/ {r src/style.css' -e 'd}' build/weave_js > build/weave_js_css

dist/weave.html: build/weave_js_css
> cp build/weave_js_css dist/weave.html

clean:
> rm dist/*
> rm build/*

ifeq ($(origin .RECIPEPREFIX), undefined)
	$(error This Make does not support .RECIPEPREFIX. Please use GNU Make 4.0 or later)
endif
.RECIPEPREFIX = >
.ONESHELL: #

# TODO(me) fix sed/gsed

all: dist/om.html

serve: all
> echo "http://127.0.0.1:8000/dist/om.html"
> python3 -m http.server 8000

build/main_js: src/*.js
> gsed -e '/.. highlight.js/ {r src/highlight.js' -e 'd}' src/main.js > build/t1
> gsed -e '/.. load.js/ {r src/load.js' -e 'd}' build/t1 > build/t2
> gsed -e '/.. commands.js/ {r src/commands.js' -e 'd}' build/t2 > build/main_js

build/om_js: build/main_js src/om.html
> gsed -e '/main.js/ {r build/main_js' -e 'd}' src/om.html > build/om_js

build/om_js_css: build/om_js src/style.css
> gsed -e '/style.css/ {r src/style.css' -e 'd}' build/om_js > build/om_js_css

dist/om.html: build/om_js_css
> cp build/om_js_css dist/om.html

clean:
> rm dist/*
> rm build/*

dist_bin_SCRIPTS = gnusto

gjsdir = $(datadir)/gjs-1.0/gnusto
gjs_SCRIPTS = engine.js wrapper.js

BUILT_SOURCES = engine.js gnusto

gnusto: gnusto.in
	sed -e s,@DATADIR@,$(datadir),g $^ > $@

engine.js: remedial.js gnusto-engine.js
	echo "// Generated file; do not edit" > $@
	cat $^ >> $@

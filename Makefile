messages.pot: babel.cfg $(wildcard *.py) $(wildcard templates/*.html)
	pybabel extract -F babel.cfg -k lazy_gettext -o messages.pot .
	pybabel update -i messages.pot -d translations

# To add a new language (ex.: es)
# pybabel init -i messages.pot -d translations -l es
# pybabel compile -d translations

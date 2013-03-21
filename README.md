HOW TO INSTALL CSSMATIC
=======================

Run install.sh


HOW TO TRANSLATE CSSMATIC TO A NEW LANGUAGE
===========================================

<LANG> is a two letter language code, like `es` for spanish.

    $ pybabel init -i messages.pot -d translations -l <LANG>
    [... put your translations in translations/<LANG>/LC_MESSAGES/messages.po ...]
    $ pybabel compile -d translations


HOW TO UPDATE AN EXISTENT TRANSLATION
=====================================

    [... update translations/<LANG>/LC_MESSAGES/messages.po ...]
    $ pybabel compile -d translations


HOW TO EXTRACT NEW MESSAGES IN HTML / PYTHON CODE AND TRANSLATE THEM
====================================================================

    $ make messages.pot
    [... update translations/<LANG>/LC_MESSAGES/messages.po ...]
    $ pybabel compile -d translations


FAQ
===

1. How do I install pybabel?

Run `pip install -r requirements.txt`.

2. How do I install pip?

Run `easy_install pip` or `apt-get install python-pip`.

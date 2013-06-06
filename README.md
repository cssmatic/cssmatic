How to install CSSMatic
=======================

Run install.sh


How to translate CSSMatic to a new language
===========================================

<code>&lt;LANG&gt;</code> is a two letter language code, like `es` for spanish.

    $ pybabel init -i messages.pot -d translations -l <LANG>
    [... put your translations in translations/<LANG>/LC_MESSAGES/messages.po ...]
    $ pybabel compile -d translations


How to update an existing translation
=====================================

    [... update translations/<LANG>/LC_MESSAGES/messages.po ...]
    $ pybabel compile -d translations


How to extract new messages in HTML / Python code and translate them
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

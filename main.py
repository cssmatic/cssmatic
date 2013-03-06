# -*- coding: utf-8 -*-
from collections import namedtuple
from flask import abort
from flask import Flask
from flask import g
from flask import make_response
from flask import request
from flask import render_template
from flaskext.babel import Babel
from flaskext.babel import gettext
from flaskext.babel import lazy_gettext
from flask_mail import Mail
from flask_mail import Message
from functools import wraps
import hashlib
from jinja2 import evalcontextfilter, Markup, escape
from werkzeug import SharedDataMiddleware
import os
from raven.contrib.flask import Sentry
import textwrap
import threading
import uuid


app = Flask(__name__)
app.config.update(
    DEBUG=False,
    SECRET_KEY='gQkxXzQM3gSsy76hm3pIa0s1iUQX5wRY',
    DEFAULT_MAX_EMAILS=2,
    MAIL_FAIL_SILENTLY=False
)
app.config.from_pyfile('application.cfg', silent=True)
babel = Babel(app)
mail = Mail(app)
if app.config.get('SENTRY_DSN'):
    sentry = Sentry(app)

# check we are not using the default SECRET_KEY in production
if not app.config['DEBUG']:
    assert app.config['SECRET_KEY'] != 'kjvM3jgC4zI$j3$zBc@2eXpVY*!oG5Y*'
# configure logs
if app.config.get('LOGGING'):
    try:
        logging_config.dictConfig(app.config.get('LOGGING'))  # pylint: disable=E1101
    except AttributeError:
        logging.basicConfig(level=logging.DEBUG)
        print 'The logging will not be correctly configured because you are running with Python 2.6'


SUPPORTED_LANGUAGES = ['es', 'en']
CSSMATIC_SENDER_EMAIL = 'info@thumbr.it'
CSSMATIC_ADMIN_EMAILS = ['alechobi@gmail.com', 'joaquin@cuencaabela.com']
STATIC_MAX_AGE_CACHE_S = 24 * 60 * 60  # 1 day
MAX_AGE_CACHE_S = 300  # 5 minutes
STATIC_DIR = os.path.join(os.path.dirname(__file__), 'static')


#####################################
# Plugin definitions
#####################################

class PagePlugin(object):
    def __init__(self, cssname, urlpath, humanname, imgpath, description_html):
        self.cssname = cssname
        self.urlpath = urlpath
        self.humanname = humanname
        self.imgpath = imgpath
        self.bigimgpath = '/img/%s-sketch.png' % cssname
        self.description_html = description_html

    @property
    def url(self):
        locale = get_locale()
        if locale and locale != 'en':
            return '/' + locale + self.urlpath
        else:
            return self.urlpath


page_plugins = [
    PagePlugin(
        'gradient',
        '/gradient-generator',
        lazy_gettext(u'Gradient Generator'),
        '/img/img-01.png',
        lazy_gettext(
            u"""<p>Use multiple colors and opacity stops to get amazing gradients.
            By using the gradient tool you can create gradients with smooth color changing
            effects and subtle transparencies.</p>

            <p>Such images can be used as background images of banners, wallpapers, buttons or
            tables and in many other applications.</p>""")),
    PagePlugin(
        'border',
        '/border-radius',
        lazy_gettext(u'Border Radius'),
        '/img/img-02.png',
        lazy_gettext(
            u"""<p>Super easy to use and a super time saver. Change all the borders selected at
            the same time.</p>""")),
    PagePlugin(
        'noise',
        '/noise-texture',
        lazy_gettext(u'Noise Texture'),
        '/img/img-03.png',
        lazy_gettext(
            u"""<p>Create subtle background patterns with dirty pixels and noise, changing
            the color and values and previewing the results in real time.""")),
    PagePlugin(
        'shadow',
        '/box-shadow',
        lazy_gettext(u'Box Shadow'),
        '/img/img-04.png',
        lazy_gettext(
            u"""<p>Blur radius changes, color changes, shadow size…  Everything that you need
            to create great drop shadows in a single place.</p>"""))
]


def sha1(st):
    """Generate sha1 token from string."""
    return hashlib.sha1(st).hexdigest()  # pylint: disable=E1101


def httpcache(public=True, max_age=MAX_AGE_CACHE_S):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            response = make_response(f(*args, **kwargs))
            if response:
                response.cache_control.public = public
                response.cache_control.max_age = max_age
            return response
        return decorated_function
    return decorator


#####################################
# Template filters
#####################################

_static_hashes = {}
_static_hashes_lock = threading.Lock()


@app.template_filter()
@evalcontextfilter
def ws2br(eval_ctx, value):
    return Markup('<br>'.join(escape(value).split()))


@app.template_filter()
@evalcontextfilter
def static_v(eval_ctx, url):
    filename = url.lstrip('/')
    abs_path = os.path.join(STATIC_DIR, filename)
    with _static_hashes_lock:
        v = _static_hashes.get(abs_path)
        if not v:
            if app.config.get('DEBUG'):
                print app.config
                v = 'DEBUG-' + str(uuid.uuid4())
            elif app.config.get('TEST'):
                v = 'TEST-' + str(uuid.uuid4())
            else:
                contents = open(abs_path, 'rb').read()
                h = sha1(contents)
                v = h[:8]
            _static_hashes[abs_path] = v
    return url + '?v=' + v


#####################################
# I18N helper functions
#####################################

@babel.localeselector
def get_locale():
    # if a user is logged in, use the locale from the user settings
    user = getattr(g, 'user', None)
    if user is not None:
        return user.locale
    if request.view_args.get('lang') in SUPPORTED_LANGUAGES:
        return request.view_args.get('lang')
    return request.accept_languages.best_match(SUPPORTED_LANGUAGES)


@babel.timezoneselector
def get_timezone():
    user = getattr(g, 'user', None)
    if user is not None:
        return user.timezone


#####################################
# URL handlers
#####################################

# we can only httpcache URLs that have a lang argument. The result of
# the page that don't have a lang argument depends on Accept-Language.
@app.route('/')
def home_page():
    return render_template('index.html', page_id='home', page_plugins=page_plugins)


@app.route('/about')
def about_page():
    return render_template('about.html', page_id='about', page_plugins=page_plugins)


@app.route('/contact', methods=['GET', 'POST'])
def contact_page():
    errors = []
    sent_success = False

    if request.method == 'POST':
        first_name = request.form['first_name']
        last_name = request.form['last_name']
        email = request.form['email']
        organization = request.form['organization']
        phone = request.form['phone']
        route = request.form['route']
        message = request.form['message']

        if not first_name:
            errors.append(gettext('The name is empty'))
        if not last_name:
            errors.append(gettext('The family name is empty'))
        if not email:
            errors.append(gettext('The email is empty'))
        if not route:
            errors.append(gettext('The reason to contact is empty'))
        if not message:
            errors.append(gettext('The message is empty'))

        if not errors:
            msg = Message(sender=CSSMATIC_SENDER_EMAIL,
                          recipients=CSSMATIC_ADMIN_EMAILS,
                          body=u'The user %s %s (%s) said:\n\n%s' % (
                            first_name, last_name, email, message),
                          subject='Message from a CSSmatic user')
            mail.send(msg)
            sent_success = True

    return render_template(
        'contact.html',
        page_id='contact',
        page_plugins=page_plugins,
        errors=errors,
        sent_success=sent_success)


@app.route('/<plugin_name>', defaults={'lang': 'en'})
@app.route('/<lang>/<plugin_name>')
@httpcache()
def plugins_page(plugin_name, lang='en'):
    plugin = [p for p in page_plugins if p.urlpath[1:] == plugin_name]
    if plugin:
        plugin = plugin[0]
    else:
        abort(404)

    if lang not in SUPPORTED_LANGUAGES:
        abort(404)

    return render_template(
        plugin_name + '.html',
        page_id=plugin.cssname,
        plugin=plugin,
        page_plugins=page_plugins)


app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
  '/': STATIC_DIR
}, cache=True, cache_timeout=STATIC_MAX_AGE_CACHE_S)


if __name__ == '__main__':
    app.run()

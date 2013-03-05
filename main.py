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
from flask_mail import Mail
from flask_mail import Message
from functools import wraps
from jinja2 import evalcontextfilter, Markup, escape
from werkzeug import SharedDataMiddleware
import os


app = Flask(__name__)
app.config.update(
    DEBUG=True,
    SECRET_KEY='gQkxXzQM3gSsy76hm3pIa0s1iUQX5wRY',
    DEFAULT_MAX_EMAILS=2,
    MAIL_FAIL_SILENTLY=False
)
app.config.from_pyfile('application.cfg', silent=True)
babel = Babel(app)
mail = Mail(app)

# check we are not using the default SECRET_KEY in production
if not app.config['DEBUG']:
    assert app.config['SECRET_KEY'] != 'kjvM3jgC4zI$j3$zBc@2eXpVY*!oG5Y*'

CSSMATIC_SENDER_EMAIL = 'info@thumbr.it'
CSSMATIC_ADMIN_EMAILS = ['alechobi@gmail.com', 'joaquin@cuencaabela.com']
LONG_MAX_AGE_CACHE_S = 300  # 5 minutes

PagePlugin = namedtuple(
    'PagePlugin', 'cssname urlpath humanname_html imgpath bigimgpath description_html')
page_plugins = [
    PagePlugin(
        'gradient',
        '/gradient',
        Markup(u'Gradient Generator'),
        '/img/img-01.png',
        '/img/gradient-sketch.png',
        Markup(u"""<p>Use multiple colors and opacity stops to get amazing and quality results.
            By using the gradient tool you can create super color fill with smooth color changing
            effects.</p>

            <p>Such images can be used as background image of banners, wallpapers, buttons or
            tables and in many other applications.</p>""")),
    PagePlugin(
        'border',
        '/border',
        Markup(u'Border Radius'),
        '/img/img-02.png',
        '/img/border-sketch.png',
        Markup(u"""<p>Super easy to use and super time saver. Change all the borders selected at
            the same time. That's it.</p>""")),
    PagePlugin(
        'noise',
        '/noise',
        Markup(u'Noise Texture'),
        '/img/img-03.png',
        '/img/noise-sketch.png',
        Markup(u"""<p>The coolest design feature in these days…  By changing the color and values
            using the intuitive slider, the generator makes it so simple to create background
            textures for websites. Done!""")),
    PagePlugin(
        'shadow',
        '/shadow',
        Markup(u'Box Shadow'),
        '/img/img-04.png',
        '/img/shadow-sketch.png',
        Markup(u"""<p>Blur radius changes, color changes then all you need is to start the
            countdown: three, two, one… Get it.</p>"""))
]


def httpcache(public=True, max_age=LONG_MAX_AGE_CACHE_S):
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


@app.template_filter()
@evalcontextfilter
def ws2br(eval_ctx, value):
    return Markup('<br>'.join(escape(value).split()))


@app.route('/')
@httpcache()
def home_page():
    return render_template('index.html', page_id='home', page_plugins=page_plugins)


@app.route('/about')
@httpcache()
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


@app.route('/<plugin_name>')
@httpcache()
def plugins_page(plugin_name):
    plugin = [p for p in page_plugins if p.urlpath[1:] == plugin_name]
    if plugin:
        plugin = plugin[0]
    else:
        abort(404)

    return render_template(
        plugin_name + '.html',
        page_id=plugin.cssname,
        page_plugins=page_plugins)


app.wsgi_app = SharedDataMiddleware(app.wsgi_app, {
  '/': os.path.join(os.path.dirname(__file__), 'static')
})


if __name__ == '__main__':
    app.run(debug=True)

import requests
from esi_config import client_id, secret_key
import json
from database import Character, User
from flask_app import app
from flask_login import LoginManager, current_user, login_required, login_user, logout_user
from flask import session, redirect, request
from esi_config import callback_url, client_id, scopes, login_url, app_url
import random
import hmac
import hashlib

login_manager = LoginManager()
login_manager.init_app(app)


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


@app.route('/auth/login')
def login():
    return login_helper('login')


@app.route('/auth/logout')
@login_required
def logout():
    logout_user()
    return redirect(app_url)


login_manager.login_view = login


@app.route('/auth/link_alt')
@login_required
def link_alt():
    return login_helper('link')


def login_helper(login_type):
    session['token'] = login_type + ':' + generate_token()
    params = {
        'redirect_uri': callback_url,
        'client_id': client_id,
        'response_type': 'code',
        'state': session['token'],
        'scope': scopes,
    }
    eve_login_url = login_url + '?' + '&'.join(
        '{}={}'.format(k, v) for k, v in params.items())
    return redirect(eve_login_url)


@app.route('/auth/oauth_callback', methods=['GET'])
def api_oauth_callback():
    code = request.args.get('code')
    token = request.args.get('state')
    session_token = session.pop('token', None)
    if (token is None) or (session_token is None) or token != session_token:
        return 'Login Eve Online SSO failed: Session Token Mismatch', 403
    login_type = session_token.split(':')[0]
    character = process_oauth(code)
    if login_type == 'login':
        user = User.get(character.user_id)
        login_user(user)
    elif login_type == 'link':
        character.user_id = current_user.id
    else:
        return 'OAuth callback does not specify login type.', 500
    return redirect(app_url)


def generate_token():
    """Generates a non-guessable OAuth token"""
    chars = ('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')
    rand = random.SystemRandom()
    random_string = ''.join(rand.choice(chars) for _ in range(40))
    return hmac.new(
        app.secret_key,
        random_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


def process_oauth(code):
    result = requests.post(
        'https://login.eveonline.com/oauth/token',
        auth=(client_id, secret_key),
        data={
            'grant_type': 'authorization_code',
            'code': code,
        }
    )
    token_data = json.loads(result.text)
    result = requests.get(
        'https://login.eveonline.com/oauth/verify',
        headers={
            'Authorization': 'Bearer {}'.format(token_data['access_token'])
        },
        data={
            'grant_type': 'authorization_code',
            'code': code,
        }
    )
    user_data = json.loads(result.text)

    refresh_token, character_id = token_data['refresh_token'], user_data['CharacterID']
    character = Character.get(character_id)
    character.refresh_token = refresh_token
    character.put()

    return character

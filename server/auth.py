import requests
from esi_config import client_id, secret_key
import json
from database import Character, User
from flask_app import app
from flask_login import LoginManager, current_user, login_required, login_user, logout_user
from flask import session, redirect, request
from esi_config import \
    callback_url, client_id, scopes, login_url, app_url, react_app_url, applicant_url, recruiter_url
import random
import hmac
import hashlib
from exceptions import ForbiddenException, AppException
import backoff

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/app/index.html"

def ensure_has_access(user_id, target_user_id, self_access=False):
    if not has_access(user_id, target_user_id, self_access=self_access):
        raise ForbiddenException(
            'User {} does not have access to target user {}'.format(
                user_id, target_user_id)
        )


def has_access(user_id, target_character_id, self_access=False):
    target_character = Character.get(target_character_id)
    user = User.get(user_id)
    target_user = User.get(target_character.user_id)
    if user.is_admin:
        return True
    elif self_access and (user_id == target_character.user_id):
        return True
    elif user.is_senior_recruiter and target_user.is_applicant:
        return True
    elif user.is_recruiter and target_user.is_applicant and (target_user.recruiter_id == user.get_id()):
        return True
    else:
        return False


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


@app.route('/auth/login')
def login():
    """
    Redirects user to ESI SSO login.
    """
    return login_helper('login')


@app.route('/auth/logout')
@login_required
def logout():
    """
    Logs out the current user.
    """
    logout_user()
    return redirect(react_app_url)


@app.route('/auth/link_alt')
@login_required
def link_alt():
    """
    Redirects user to ESI SSO login for the purposes of linking an alt.
    """
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
        return ForbiddenException(
            'Login to Eve Online SSO failed: Session Token Mismatch')
    login_type = session_token.split(':')[0]
    character = process_oauth(code)
    if login_type == 'login':
        print('char', character)
        user = User.get(character.user_id, name=character.name)
        login_user(user)
        if user.is_applicant:
            return redirect(f'{react_app_url}?showing=applicant')
        return redirect(recruiter_url)
    elif login_type == 'link':
        character.user_id = current_user.get_id()
        character.put()
        return redirect(applicant_url)
    else:
        return AppException(
            'OAuth callback state specified invalid login type {}.'.format(login_type))
    return redirect(react_app_url)


def generate_token():
    """Generates a non-guessable OAuth token"""
    chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    rand = random.SystemRandom()
    random_string = ''.join(rand.choice(chars) for _ in range(len(chars)))
    return hmac.new(
        app.secret_key,
        random_string.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()


@backoff.on_exception(
    backoff.expo, requests.exceptions.RequestException, max_time=10,
)
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

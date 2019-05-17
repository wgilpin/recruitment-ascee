import requests
import json
from models import Character, User, db, Application
from flask_app import app
from flask_login import LoginManager, current_user, login_required, login_user, logout_user
from flask import session, redirect, request
from esi_config import (
    callback_url, client_id, secret_key, scopes, login_url,
    react_app_url, applicant_url, recruiter_url, admin_url, rejection_url,
    wrong_character_url, send_mail_scope,
)
from mail import set_mail_character
import random
import os
import hmac
import hashlib
from exceptions import ForbiddenException, AppException
import backoff
from functools import wraps
from security import is_admin, is_recruiter
from status import add_status_note

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/auth/login"


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


class EveSSO(object):

    def __init__(self):
        self._callback_functions = {}
        self._scopes = {}

    def register_callback(self, name, callback_function, scopes=None):
        self._callback_functions[name] = callback_function
        self._scopes[name] = scopes

    def call_sso(self, callback_name, user_id=None):
        user_id = user_id or -1
        session['token'] = callback_name + ':' + str(user_id) + ':' + generate_token()
        params = {
            'redirect_uri': callback_url,
            'client_id': client_id,
            'response_type': 'code',
            'state': session['token'],
        }
        if self._scopes[callback_name] is not None:
            params['scope'] = self._scopes[callback_name]
        eve_login_url = login_url + '?' + '&'.join(
            '{}={}'.format(k, v) for k, v in params.items())
        return redirect(eve_login_url)

    def process_callback(self, code, token):
        session_token = session.pop('token', None)
        if (token is None) or (session_token is None) or token != session_token:
            # abort operation
            print('Login to Eve Online SSO failed: Session Token Mismatch for token'
                  ' {} and session_token {}'.format(token, session_token))
            return redirect(react_app_url)
        callback_name = session_token.split(':')[0]
        user_id = int(session_token.split(':')[1])
        refresh_token, character_id = process_oauth_code(code)
        if callback_name not in self._callback_functions:
            raise AppException(
                'OAuth callback state specified invalid callback type {}.'.format(
                    callback_name)
            )
        if user_id > 0:
            return self._callback_functions[callback_name](refresh_token, character_id, user_id=user_id)
        else:
            return self._callback_functions[callback_name](refresh_token, character_id)


def process_mail(refresh_token, character_id):
    if current_user.is_authenticated and is_admin(current_user):
        character = Character.get(character_id)
        character.refresh_token = refresh_token
        db.session.commit()
        set_mail_character(character, current_user=current_user)
    return route_to_app_home()


def process_scopes(refresh_token, character_id, user_id):
    character = Character.get(character_id)
    if user_id != character.id:
        logout_user()
        return redirect(wrong_character_url)
    else:
        character.refresh_token = refresh_token
        db.session.commit()
        login_user(User.get(user_id))
        return route_to_app_home()


def process_login(refresh_token, character_id):
    character = Character.get(character_id)
    if character.user_id is None:
        User.get(character_id)
        character.user_id = character_id
        db.session.commit()
    user = User.get(character.user_id)
    login_user(user)
    return route_to_app_home()


def process_alt(refresh_token, character_id):
    if current_user.is_authenticated:
        character = Character.get(character_id)
        character.user_id = current_user.id
        character.refresh_token = refresh_token
        db.session.commit()

        application = Application.get_for_user(current_user.id)
        if application is not None:
            add_status_note(
                application, 'Added an alt: {} / {}.'.format(
                    character.name, character.id))
            db.session.commit()
        if character.blocked_from_applying:
            block_user_from_applying(current_user)
            logout_user()
            return redirect(rejection_url)
        else:
            return route_to_app_home()
    else:
        return redirect(react_app_url)

sso = EveSSO()
sso.register_callback('mail', process_mail, scopes=send_mail_scope)
sso.register_callback('scopes', process_scopes, scopes=scopes)
sso.register_callback('login', process_login)
sso.register_callback('link_alt', process_alt, scopes=scopes)


@app.route('/auth/oauth_callback', methods=['GET'])
def api_oauth_callback():
    code = request.args.get('code')
    token = request.args.get('state')
    return sso.process_callback(code, token)


def route_to_app_home():
    user = current_user
    if not user.is_authenticated:
        sso.call_sso('login')
    if not (is_recruiter(user) or is_admin(user)):
        character = Character.get(id=user.id)
        if character.refresh_token is None:
            user_id = user.id
            logout_user()
            return sso.call_sso('scopes', user_id=user_id)
        else:
            return redirect(applicant_url)
    elif is_recruiter(user):
        return redirect(recruiter_url)
    elif is_admin(user):
        return redirect(admin_url)

      
def block_user_from_applying(user):
    for character in user.characters:
        character.blocked_from_applying = True
    application = db.session.Query(Application).filter(
        db.and_(Application.user_id == user.id,
                db.not_(Application.is_concluded))
    ).one_or_none()
    if application:
        application.is_concluded = True
    db.session.commit()


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
def process_oauth_code(code):
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
    if 'ASCEE_SHOW_TOKENS' in os.environ and os.environ['ASCEE_SHOW_TOKENS'] and refresh_token:
        print(f'TOKEN for {character_id}: {refresh_token}')
    return refresh_token, character_id

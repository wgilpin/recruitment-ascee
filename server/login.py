import requests
import json
from models import Character, User, db, Application
from flask_app import app
from flask_login import LoginManager, current_user, login_required, login_user, logout_user
from flask import session, redirect, request
from esi_config import (
    callback_url, client_id, secret_key, scopes, login_url, app_url,
    react_app_url, applicant_url, recruiter_url, admin_url, rejection_url
)
import random
import os
import hmac
import hashlib
from exceptions import ForbiddenException, AppException
import backoff
from functools import wraps
from security import is_admin, is_recruiter

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = "/auth/login"


@login_manager.user_loader
def load_user(user_id):
    return User.get(user_id)


def login_helper(login_type):
    session['token'] = login_type + ':' + generate_token()
    params = {
        'redirect_uri': callback_url,
        'client_id': client_id,
        'response_type': 'code',
        'state': session['token'],
    }
    if login_type == 'scopes':
        params['scope'] = scopes
    eve_login_url = login_url + '?' + '&'.join(
        '{}={}'.format(k, v) for k, v in params.items())
    return redirect(eve_login_url)


@app.route('/auth/oauth_callback', methods=['GET'])
def api_oauth_callback():
    code = request.args.get('code')
    token = request.args.get('state')
    session_token = session.pop('token', None)
    if (token is None) or (session_token is None) or token != session_token:
        raise ForbiddenException(
            'Login to Eve Online SSO failed: Session Token Mismatch')
    login_type = session_token.split(':')[0]
    character = process_oauth(login_type, code)
    return route_login(login_type, character)


def route_login(login_type, character):
    if login_type == 'login':
        print('char', character)
        user = User.get(character.user_id)
        login_user(user)
        if not (is_recruiter(user) or is_admin(user)):
            if Application.get_for_user(user.id) is None:
                if character.blocked_from_applying:
                    logout_user()
                    return redirect(rejection_url)
            if character.refresh_token is None:
                return login_helper('scopes')
            else:
                return redirect(applicant_url)
        elif is_recruiter(user):
            return redirect(recruiter_url)
        elif is_admin(user):
            return redirect(admin_url)
    elif login_type == 'scopes':
        return redirect(applicant_url)
    elif login_type == 'link':
        return link_alt(character, current_user)
    else:
        raise AppException(
            'OAuth callback state specified invalid login type {}.'.format(login_type))


def link_alt(character, user):
    character.user_id = user.get_id()
    db.session.commit()
    if character.blocked_from_applying:
        block_user_from_applying(user)
        logout_user()
    return redirect(rejection_url)


def block_user_from_applying(user):
    for character in user.characters:
        character.blocked_from_applying = True
    application = db.session.Query(Application).filter(
        db.and_(Application.user_id==user.id, db.not_(Application.is_concluded))
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
def process_oauth(login_type, code):
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
    if 'ASCEE_SHOW_TOKENS' in os.environ and os.environ['ASCEE_SHOW_TOKENS'] and refresh_token:
        print (f'TOKEN for {character_id}: {refresh_token}')
    if login_type in ('scopes', 'link'):
        character.refresh_token = refresh_token
        db.session.commit()

    return character

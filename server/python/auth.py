import requests
import request
from esi_config import client_id, secret_key
import json
from character_data import get_character


def process_oauth(code, save_refresh_token=True):
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
    if save_refresh_token:
        refresh_token, character_id = token_data['refresh_token'], user_data['CharacterID']
        character = get_character(character_id)
        character.refresh_token = refresh_token
    return character_id

import sys
import os

server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
import unittest
from character import get_character_summary
from models import Character, User, db, Type, Region, System, Corporation, Alliance, Station
from base import AsceeTestCase
from flask_app import app
from test_character_simple_apis import SimpleCharacterMixin


def esi_wrap_to_list(character_id, current_user=None):
    result = get_character_summary(character_id, current_user=current_user)
    return {'info': [result['info']]}


class CharacterSummaryTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': esi_wrap_to_list,
        'required': {
            'character_name': str,
            'character_id': int,
            'current_application_id': int,
            'corporation_name': str,
            'corporation_id': int,
            'security_status': float,
        },
        'optional': {
            'current_application_status': str,
            'alliance_name': (str, type(None)),
        },
        'redlisting': {
            'corporation_name': (Corporation, 'corporation_id'),
            'character_name': (Character, 'character_id'),
        },
        'entry_identifier': 'character_id',
    }


    def test_get_admin_API(self):
        pass  # admin isn't a real character

    def test_get_recruiter_API(self):
        pass  # recruiter isn't a real character



if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

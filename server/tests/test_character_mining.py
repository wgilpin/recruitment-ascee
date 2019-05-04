import sys
import os

server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
import unittest
import character
from models import Character, User, db, Type, Region, System, Corporation, Alliance, Station
from base import AsceeTestCase
from flask_app import app
from test_character_simple_apis import SimpleCharacterMixin


class CharacterMiningTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.mining.get_character_mining,
        'required': {
            'date': str,
            'quantity': int,
            'system_id': int,
            'system_name': str,
            'type_id': int,
            'type_name': str,
            'value': float,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'system_name': (System, 'system_id'),
        },
        # it's fine that this can match multiple entries, since we're only testing system redlisting
        'entry_identifier': 'system_id',
    }


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

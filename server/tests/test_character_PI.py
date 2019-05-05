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


class CharacterPITests(SimpleCharacterMixin, AsceeTestCase):
    api_definition = {
        'fetch_function': character.planetary_interaction.get_character_planetary_interaction,
        'required': {
            'last_update': str,
            'num_pins': int,
            'owner_id': int,
            'planet_id': int,
            'planet_type': str,
            'system_id': int,
            'system_name': str,
            'region_id': int,
            'region_name': str,
            'upgrade_level': int,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'system_name': (System, 'system_id'),
            'region_name': (Region, 'region_id'),
        },
        'entry_identifier': 'planet_id',
    }



if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

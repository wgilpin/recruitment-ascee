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


class CharacterFittingsTests(SimpleCharacterMixin, AsceeTestCase):

    # results from ESI, Each result additionally has the key 'ship_type_name',
    # and each item has the additional key 'type_name'.
    api_definition = {
        'fetch_function': character.fittings.get_character_fittings,
        'required': {
            'description': str,
            'fitting_id': int,
            'items': list,
            'name': str,
            'ship_type_id': int,
            'ship_type_name': str,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'ship_type_name': (Type, 'ship_type_id'),
            'items': {
                'type_name': (Type, 'type_id'),
                'entry_identifier': 'type_id',
            },
        },
        'entry_identifier': 'fitting_id',
    }

    def helper_simple_APIs(self, response, api_def):
        super(CharacterFittingsTests, self).helper_simple_APIs(response, api_def)
        for data in response['info']:
            for item in data['items']:
                for attr, type in (
                        ('flag', str),
                        ('quantity', int),
                        ('type_id', int),
                        ('type_name', str)):
                    self.assertIn(attr, item, attr)
                    self.assertIsInstance(item[attr], type, attr)



if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

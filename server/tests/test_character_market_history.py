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


class CharacterMarketHistoryTests(SimpleCharacterMixin, AsceeTestCase):
  
    api_definition = {
        'fetch_function': character.finance.get_character_market_history,
        'required': {
            'order_id': int,
            'is_buy_order': bool,
            'value': float,
            'price': float,
            'volume_total': int,
            'location_name': str,
            'region_id': int,
            'region_name': str,
            'type_id': int,
            'type_name': str,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'type_name': (Type, 'type_id'),
            'region_name': (Region, 'region_id'),
        },
        'entry_identifier': 'order_id',
    }

if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

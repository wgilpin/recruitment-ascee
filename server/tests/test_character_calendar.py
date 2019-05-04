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


class CharacterCalendarTests(SimpleCharacterMixin, AsceeTestCase):
  
    api_definition = {
        'fetch_function': character.get_character_calendar,
        'required': {
            'event_date': str,
            'event_id': int,
            'event_response': str,
            'importance': int,
            'title': str,
            'duration': int,
            'owner_id': int,
            'owner_name': str,
            'owner_type': str,
            'response': str,
            'text': str,
        },
        'optional': {
        },
        'redlisting': {
        },
        'entry_identifier': 'event_id',
    }



if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

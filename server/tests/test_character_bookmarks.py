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


class CharacterBookmarksTests(SimpleCharacterMixin, AsceeTestCase):
  
    api_definition = {
        'fetch_function': character.bookmarks.get_character_bookmarks,
        'required': {
            'system_id': int,
            'system_name': str,
            'redlisted': list,
            'bookmark_id': int,
            'notes': str,
            'location_id': int,
            'creator_id': int,
            'label': str,
        },
        'optional': {
            'folder_id': int,
            'folder_name': str,
        },
        'redlisting': {
            'system_name': (System, 'system_id'),
        },
        'entry_identifier': 'bookmark_id',
    }



if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

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


class CharacterIndustryTests(SimpleCharacterMixin, AsceeTestCase):
    api_definition = {
        'fetch_function': character.industry.get_character_industry,
        'required': {
            'activity_id': int,
            'blueprint_id': int,
            'blueprint_location_id': int,
            'blueprint_type_id': int,
            'blueprint_type_name': str,
            'duration': int,
            'end_date': str,
            'facility_id': int,
            'installer_id': int,
            'job_id': int,
            'output_location_id': int,
            'runs': int,
            'start_date': str,
            'station_id': int,
            'status': str,
            'redlisted': list,
        },
        'optional': {
            'completed_character_id': int,
            'completed_date': str,
            'cost': float,
            'licensed_runs': int,
            'pause_date': str,
            'probability': float,
            'product_type_id': int,
            'successful_runs': int,
        },
        'entry_identifier': 'activity_id',
        'redlisting': {
            'station_name': (Station, 'station_id'),
            'blueprint_type_name': (Type, 'blueprint_type_id'),
        },
    }



if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

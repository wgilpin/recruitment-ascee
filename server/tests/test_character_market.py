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



class CharacterMarketContractsTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.finance.get_character_market_contracts,
        'required': {
            'issuer_alliance_id': (int, type(None)),
            'issuer_alliance_name': (str, type(None)),
            'issuer_corporation_name': str,
            'issuer_corporation_ticker': str,
            'issuer_corporation_id': int,
            'issuer_id': int,
            'acceptor_alliance_id': (int, type(None)),
            'acceptor_alliance_name': (str, type(None)),
            'acceptor_corporation_id': (int, type(None)),
            'acceptor_corporation_name': (str, type(None)),
            'acceptor_corporation_ticker': (str, type(None)),
            'acceptor_id': int,
            'issuer_name': str,
            'acceptor_name': str,
            'redlisted': list,
            'contract_id': int,
        },
        'optional': {
            'start_location_id': int,
            'start_location_name': str,
            'end_location_id': int,
            'end_location_name': str,
        },
        'redlisting': {
            'issuer_name': (Character, 'issuer_id'),
            'acceptor_name': (Character, 'acceptor_id'),
            'issuer_corporation_name': (Corporation, 'issuer_corporation_id'),
            'issuer_corporation_ticker': (Corporation, 'issuer_corporation_id'),
            'issuer_alliance_name': (Alliance, 'issuer_alliance_id'),
        },
        'entry_identifier': 'contract_id',
    }




if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

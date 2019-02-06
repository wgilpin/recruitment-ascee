import sys
import os
server_dir = os.environ["python_server_dir"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
from exceptions import BadRequestException, ForbiddenException
import unittest
import character_data
from models import Character, User, Question, Answer, db
from base import AsceeTestCase
from flask_app import app
from datetime import datetime
import warnings


class SimpleCharTests(AsceeTestCase):

    test_definitions = {
        'contacts': {
            'fetch_function': 'get_character_contacts',
            'required': {
                'name': str,
            },
            'optional': {
                'corporation_id': int,
                'corporation_name': str,
                'alliance_id': int,
                'alliance_name': str,
                'redlisted': bool
            }
        },
        'mining': {
            'fetch_function': 'get_character_mining',
            'required': {
                'date': str,
                'quantity': float,
                'system_id': int,
                'system_name': str,
                'type_id': int,
                'type_name': str,
                'value': float,
            },
            'optional': {
                'redlisted': bool
            }
        },
        'contracts': {
            'fetch_function': 'get_character_market_contracts',
            'required': {
                'issuer_corporation_name': str,
                'issuer_id': int,
                'acceptor_id': int,
                'issuer_name': str,
                'acceptor_name': str,
            },
            'optional': {
                'start_location_id': int,
                'start_location_name': str,
                'end_location_id': int,
                'end_location_name': str,
                'redlisted': bool
            }
        },
        'bookmarks': {
            'fetch_function': 'get_character_bookmarks',
            'required': {
                'system_id': int,
                'system_name': str,
            },
            'optional': {
                'folder_id': int,
                'folder_name': str,
                'redlisted': bool
            }
        },
        'market history': {
            'fetch_function': 'get_character_market_history',
            'required': {
                'is_buy_order': bool,
                'value': float,
                'price': float,
                'volume_total': int,
                'location_name': str,
                'region_name': str,
                'type_name': str,
            },
            'optional': {
                'redlisted': bool
            },
        }
    }

    def helper_list_or_dict_item(self, entry, api_def):
        for property_name, property_type in api_def['required'].items():
            self.assertIn(property_name, entry)
            self.assertIsInstance(entry[property_name], property_type)
        for property_name, property_type in api_def['optional'].items():
            if property_name in entry:
                self.assertIn(property_name, entry)
                self.assertIsInstance(entry[property_name], property_type)


    def helper_simple_APIs(self, response, api_def):
        self.assertIn('info', response)
        if isinstance(response['info'], dict):
            for key, entry in response['info'].items():
                self.helper_list_or_dict_item(entry, api_def)
        elif isinstance(response['info'], list):
            for entry in response['info']:
                self.helper_list_or_dict_item(entry, api_def)


    def run_tests_simple_APIs(self, test_name, subject, current_user, exception=None):
        for api_name in self.test_definitions:
            api_def = self.test_definitions[api_name]
            with self.subTest(f'{test_name} for {api_name}'):
                method = getattr(character_data, api_def['fetch_function'])
                print('calling ', api_name,
                    api_def['fetch_function'], test_name)
                if exception:
                    with self.assertRaises(ForbiddenException):
                        response = method(subject, current_user=current_user)
                        self.helper_simple_APIs(response, api_def)
                else:
                    response = method(subject, current_user=current_user)
                    self.helper_simple_APIs(response, api_def)

    def test_get_applicant_API(self):
        self.run_tests_simple_APIs(
            'recruiter gets applicant', self.applicant.id, self.recruiter)

    def test_get_applicant_API_as_senior_recruiter(self):
        self.run_tests_simple_APIs(
            'snr recruiter gets applicant', self.applicant.id, self.senior_recruiter)

    def test_get_applicant_API_as_other_recruiter(self):
        self.run_tests_simple_APIs(
            'other recruiter gets applicant', self.applicant.id, self.other_recruiter, ForbiddenException)

    def test_get_applicant_API_as_admin(self):
        self.run_tests_simple_APIs(
            'admin gets applicant', self.applicant.id, self.admin, ForbiddenException)

    def test_get_recruiter_API(self):
        self.run_tests_simple_APIs(
            'recruiter gets recruiter', self.recruiter.id, self.recruiter, ForbiddenException)
        self.run_tests_simple_APIs(
            'other recruiter gets recruiter', self.recruiter.id, self.other_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(
            'senior recruiter gets recruiter', self.recruiter.id, self.senior_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(
            'admin gets recruiter', self.recruiter.id, self.admin, ForbiddenException)

    def test_get_admin_API(self):
        self.run_tests_simple_APIs(
            'recruiter gets admin', self.admin.id, self.recruiter, ForbiddenException)
        self.run_tests_simple_APIs(
            'other recruiter gets admin', self.admin.id, self.other_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(
            'snr recruiter gets admin',
            self.admin.id, self.senior_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(
            'admin gets admin', self.admin.id, self.admin, ForbiddenException)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

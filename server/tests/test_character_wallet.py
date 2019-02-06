import sys
import os
server_dir = os.environ["python_server_dir"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from character_data import get_character_wallet
from models import Character, User, Question, Answer, db
from base import AsceeTestCase
from flask_app import app
from datetime import datetime
from exceptions import BadRequestException, ForbiddenException
import warnings


class WalletTests(AsceeTestCase):

    def test_get_applicant_wallet(self):
        result = get_character_wallet(self.applicant.id, current_user=self.recruiter)
        self.helper_test_wallet_success(result)

    def test_get_applicant_wallet_as_senior_recruiter(self):
        result = get_character_wallet(self.applicant.id, current_user=self.senior_recruiter)
        self.helper_test_wallet_success(result)

    def helper_test_wallet_success(self, result):
        self.assertIn('info',  result)
        self.assertIsInstance(result['info'], list)
        wallet_list = result['info']
        self.assertGreater(len(wallet_list), 0)
        wallet_attributes = {
            'amount': int,
            'balance': float,
            'context_id': ,
            'context_id_type': str,
            'date': str,
            'description': str,
            'first_party_id': int,
            'id': int,
            'ref_type': str,
            'second_party_id': int
        }
        party_attributes = {
            'id': int,
            'name': str,
            'party_type': str,
            'corporation_name': str,
            'corporation_ticker': str,
        }
        for entry in wallet_list:
            for property_name, property_type in wallet_attributes.items():
                self.assertTrue(property_name in wallet_data)
                self.assertIsInstance(wallet_data[property_name], property_type)
            entry_date = datetime.strptime(entry['date'])
            if 'first_party' in entry:
                for property_name, property_type in entry['first_party']:
                    self.assertTrue(property_name in entry['first_party'])
                    self.assertIsInstance(entry['first_party'][property_name], property_type)
            if 'second_party' in entry:
                for property_name, property_type in entry['second_party']:
                    self.assertTrue(property_name in entry['second_party'])
                    self.assertIsInstance(entry['second_party'][property_name], property_type)


    def test_get_applicant_wallet_as_other_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.applicant.id, current_user=self.other_recruiter)

    def test_get_applicant_wallet_as_admin(self):
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.applicant.id, current_user=self.admin)

    def test_get_recruiter_wallet(self):
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.recruiter.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.recruiter.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.recruiter.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.recruiter.id, current_user=self.admin)

    def test_get_admin_wallet(self):
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.admin.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.admin.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.admin.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_wallet(self.admin.id, current_user=self.admin)

if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

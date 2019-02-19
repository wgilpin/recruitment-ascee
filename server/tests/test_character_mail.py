import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from character.mail import get_character_mail, get_mail_body
from models import Character, User, db
from base import AsceeTestCase
from flask_app import app
from exceptions import BadRequestException, ForbiddenException


class CharacterMailTests(AsceeTestCase):

    def test_get_applicant_mail(self):
        result = get_character_mail(self.applicant.id, current_user=self.recruiter)
        self.helper_test_mail_success(result)

    def test_get_applicant_mail_as_senior_recruiter(self):
        result = get_character_mail(self.applicant.id, current_user=self.senior_recruiter)
        self.helper_test_mail_success(result)

    def helper_test_mail_success(self, result):
        assert 'info' in result, result
        self.assertIsInstance(result['info'], list)
        mail_list = result['info']
        self.assertGreater(len(mail_list), 0)
        mail_attributes = {
            'from': int,
            'from_name': str,
            'is_read': bool,
            'labels': list,
            'mail_id': int,
            'recipients': list,
            'subject': str,
            'timestamp': str,
        }
        recipient_attributes = {
            'recipient_id': int,
            'recipient_type': str,
            'recipient_name': str,
        }
        for mail_data in mail_list:
            # from_name, recipient_name, ESI
            for property_name, property_type in mail_attributes.items():
                self.assertTrue(property_name in mail_data)
                self.assertIsInstance(mail_data[property_name], property_type)
            extra_attributes = set(mail_data.keys()).difference(mail_attributes.keys())
            if 'redlisted' in extra_attributes:
                extra_attributes.remove('redlisted')
            self.assertTrue(len(extra_attributes) == 0, extra_attributes)
            for recipient in mail_data['recipients']:
                for property_name, property_type in recipient_attributes.items():
                    self.assertTrue(property_name in recipient)
                    self.assertIsInstance(recipient[property_name], property_type)
                extra_attributes = set(recipient.keys()).difference(recipient_attributes.keys())
                if 'redlisted' in extra_attributes:
                    extra_attributes.remove('redlisted')
                self.assertTrue(len(extra_attributes) == 0, extra_attributes)

    def test_get_applicant_mail_as_other_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.applicant.id, current_user=self.other_recruiter)

    def test_get_applicant_mail_as_admin(self):
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.applicant.id, current_user=self.admin)

    def test_get_recruiter_mail(self):
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.recruiter.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.recruiter.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.recruiter.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.recruiter.id, current_user=self.admin)

    def test_get_admin_mail(self):
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.admin.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.admin.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.admin.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_mail(self.admin.id, current_user=self.admin)

    def mail_body_test_as_recruiter(self):
        mail_id = get_character_mail(self.applicant.id, current_user=self.recruiter)['info'][0]['mail_id']
        result = get_mail_body(mail_id, current_user=self.recruiter)
        self.helper_test_mail_body_success(result)

    def mail_body_test_as_senior_recruiter(self):
        mail_id = get_character_mail(self.applicant.id, current_user=self.recruiter)['info'][0]['mail_id']
        result = get_mail_body(mail_id, current_user=self.senior_recruiter)
        self.helper_test_mail_body_success(result)

    def helper_test_mail_body_success(self, result):
        mail_data = result
        mail_attributes = {
            'from': int,
            'from_name': str,
            'body': str,
            'read': bool,
            'labels': list,
            'mail_id': int,
            'recipients': list,
            'subject': str,
            'timestamp': str,
        }
        recipient_attributes = {
            'recipient_id': int,
            'recipient_type': str,
            'recipient_name': str,
        }
        for property_name, property_type in mail_attributes.items():
            self.assertTrue(property_name in mail_data)
            self.assertIsInstance(mail_data[property_name], property_type)
        self.assertTrue(len(mail_attributes) == len(mail_data), mail_data)
        for recipient in mail_data['recipients']:
            for property_name, property_type in recipient_attributes.items():
                self.assertTrue(property_name in recipient)
                self.assertIsInstance(recipient[property_name], property_type)
            self.assertTrue(len(recipient_attributes) == len(recipient), recipient)

    def mail_body_test_as_other_recruiter(self):
        mail_id = get_character_mail(self.applicant.id, current_user=self.recruiter)['info'][0]['mail_id']
        with self.assertRaises(ForbiddenException):
            get_mail_body(mail_id, current_user=self.other_recruiter)

    def mail_body_test_as_admin(self):
        mail_id = get_character_mail(self.applicant.id, current_user=self.recruiter)['info'][0]['mail_id']
        with self.assertRaises(ForbiddenException):
            get_mail_body(mail_id, current_user=self.admin)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

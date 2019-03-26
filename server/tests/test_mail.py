import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from models import db, MailTemplate, ConfigItem, Character
from base import AsceeTestCase
from mail import set_mail_character, set_mail_template, get_mail_character, get_mail_text, send_mail
from flask_app import app
from exceptions import BadRequestException, ForbiddenException


class MailTests(AsceeTestCase):

    def test_set_mail_character(self):
        self.assertEqual(get_mail_character(), None)
        set_mail_character(self.applicant_character, current_user=self.admin)
        self.assertEqual(get_mail_character(), self.applicant_character)

    def test_change_mail_character(self):
        self.assertEqual(get_mail_character(), None)
        set_mail_character(self.applicant_character, current_user=self.admin)
        self.assertEqual(get_mail_character(), self.applicant_character)
        set_mail_character(self.not_applicant_character, current_user=self.admin)
        self.assertEqual(get_mail_character(), self.not_applicant_character)

    def test_set_mail_character_forbidden(self):
        for user in (self.applicant, self.recruiter, self.senior_recruiter):
            with self.assertRaises(ForbiddenException):
                set_mail_character(self.applicant_character, current_user=user)

    def test_set_mail_template(self):
        set_mail_template('simple', 'Hey', 'Hello world!', current_user=self.admin)
        self.assertEqual(MailTemplate.query.get('simple').text, 'Hello world!')
        self.assertEqual(MailTemplate.query.get('simple').subject, 'Hey')

    def test_set_mail_template_with_field(self):
        set_mail_template('simple', 'Hey', 'Hello {character_name}!', current_user=self.admin)
        self.assertEqual(MailTemplate.query.get('simple').text, 'Hello {character_name}!')
        self.assertEqual(MailTemplate.query.get('simple').subject, 'Hey')

    def test_get_mail_with_field(self):
        set_mail_template('simple', 'Subject', 'Hello {character_name}!', current_user=self.admin)
        subject, mail_text = get_mail_text('simple', character_name='Bob')
        self.assertEqual(mail_text, 'Hello Bob!')
        self.assertEqual(subject, 'Subject')

    def test_get_mail_with_multiple_fields(self):
        set_mail_template('simple', 'Subject', '{salutation} {character_name}!', current_user=self.admin)
        subject, mail_text = get_mail_text('simple', character_name='Bob', salutation='Hello')
        self.assertEqual(mail_text, 'Hello Bob!')
        self.assertEqual(subject, 'Subject')

    def test_overwrite_mail_template(self):
        set_mail_template('simple', 'Subj', 'Hello {character_name}!', current_user=self.admin)
        set_mail_template('simple', 'Subjec', 'Hi {character_name}!', current_user=self.admin)
        self.assertEqual(MailTemplate.query.get('simple').text, 'Hi {character_name}!')
        self.assertEqual(MailTemplate.query.get('simple').subject, 'Subjec')

    def test_set_mail_template_forbidden(self):
        for user in (self.applicant, self.recruiter, self.senior_recruiter):
            with self.assertRaises(ForbiddenException):
                set_mail_template('simple', 'Subject', 'Hello world!', current_user=user)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

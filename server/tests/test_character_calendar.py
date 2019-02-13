import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from character.calendar import get_character_calendar
from models import Character, User, db
from base import AsceeTestCase
from flask_app import app
from datetime import datetime
from exceptions import BadRequestException, ForbiddenException
import warnings


class CalendarTests(AsceeTestCase):

    def test_get_applicant_calendar(self):
        result = get_character_calendar(self.applicant.id, current_user=self.recruiter)
        self.helper_test_calendar_success(result)

    def test_get_applicant_calendar_as_senior_recruiter(self):
        result = get_character_calendar(self.applicant.id, current_user=self.senior_recruiter)
        self.helper_test_calendar_success(result)

    def helper_test_calendar_success(self, result):
        self.assertIn('info',  result)
        self.assertIsInstance(result['info'], list)
        calendar_list = result['info']
        self.assertGreaterEqual(len(calendar_list), 0)
        calendar_attributes = {
            'event_date': str,
            'event_id': int,
            'event_response': str,
            'importance': int,
            'title': str,
            'date': str,
            'duration': int,
            'owner_id': int,
            'owner_name': str,
            'owner_type': str,
            'response': str,
            'text': str,
            'sender': str,
            'recipients': list
        }
        for event in calendar_list:
            for prop_name in event:
                self.assertIn(prop_name, calendar_attributes)
                self.assertIsInstance(event[prop_name], calendar_attributes[prop_name])
            self.assertIn('event_date', event)
            event_date = datetime.strptime(event['event_date'])
            self.assertIn('event_id', event)
            self.assertIn('event_response', event)
            self.assertIn('importance', event)
            self.assertIn('title', event)
            if 'owner_type' in event:
                self.assertIn(event['owner_type'], ['character', 'corporation', 'eve_server'])
            if 'attendees' in event:
                for attendee in event['attendees']:
                    self.assertIsInstance(attendee['name'], str)
                    self.assertGreater(len(attendee['name']), 0)
                    self.assertIsInstance(attendee['attendee_id'], int)

    def test_get_applicant_calendar_as_other_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.applicant.id, current_user=self.other_recruiter)

    def test_get_applicant_calendar_as_admin(self):
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.applicant.id, current_user=self.admin)

    def test_get_recruiter_calendar(self):
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.recruiter.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.recruiter.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.recruiter.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.recruiter.id, current_user=self.admin)

    def test_get_admin_calendar(self):
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.admin.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.admin.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.admin.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_calendar(self.admin.id, current_user=self.admin)

if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

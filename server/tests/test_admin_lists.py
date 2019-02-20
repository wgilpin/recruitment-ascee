import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from models import db, Character
from base import AsceeTestCase
from flask_app import app
from exceptions import BadRequestException, ForbiddenException
from admin import get_admin_list, add_admin_list_item, remove_admin_list_item, put_admin_list


class AdminListTestCase(AsceeTestCase):

    def test_get_admin_list(self):
        result = get_admin_list('character', current_user=self.admin)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], list)
        self.assertEqual(len(result['info']), 2)

        result = get_admin_list('type', current_user=self.admin)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], list)
        self.assertEqual(len(result['info']), 0)

        with self.assertRaises(ForbiddenException):
            get_admin_list('character', current_user=self.recruiter)

        with self.assertRaises(ForbiddenException):
            get_admin_list('character', current_user=self.senior_recruiter)

        with self.assertRaises(ForbiddenException):
            get_admin_list('character', current_user=self.senior_recruiter)

        with self.assertRaises(ForbiddenException):
            get_admin_list('character', current_user=self.applicant)

    def test_add_admin_list_item(self):
        add_admin_list_item('character', self.applicant_character.id, current_user=self.admin)
        new_list = get_admin_list('character', current_user=self.admin)
        self.assertEqual(len(new_list['info']), 3)
        self.assertTrue(self.applicant_character.redlisted)

        with self.assertRaises(ForbiddenException):
            add_admin_list_item(
                'character', self.not_applicant_character.id, current_user=self.applicant)
        with self.assertRaises(ForbiddenException):
            add_admin_list_item(
                'character', self.not_applicant_character.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            add_admin_list_item(
                'character', self.not_applicant_character.id, current_user=self.senior_recruiter)

    def test_remove_admin_list_item(self):
        remove_admin_list_item('character', self.redlisted_character_1.id, current_user=self.admin)
        new_list = get_admin_list('character', current_user=self.admin)
        self.assertEqual(len(new_list['info']), 1)

        with self.assertRaises(BadRequestException):
            remove_admin_list_item(
                'character', self.redlisted_character_1.id, current_user=self.admin)

    def test_forbidden_remove_admin_list_item(self):
        with self.assertRaises(ForbiddenException):
            remove_admin_list_item(
                'character', self.redlisted_character_2.id, current_user=self.applicant)
        with self.assertRaises(ForbiddenException):
            remove_admin_list_item(
                'character', self.redlisted_character_2.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            remove_admin_list_item(
                'character', self.redlisted_character_2.id, current_user=self.senior_recruiter)

    def test_admin_list_add_multi(self):
        new_items = [self.applicant_character.id, self.not_applicant_character.id]
        put_admin_list('character', new_items, do_replace=False, current_user=self.admin)
        new_list = get_admin_list('character', current_user=self.admin)
        self.assertEqual(len(new_list['info']), 4)
        self.assertTrue(self.applicant_character.redlisted)
        self.assertTrue(self.not_applicant_character.redlisted)

    def test_forbidden_admin_list_add_multi(self):
        new_items = [self.applicant_character.id, self.not_applicant_character.id]
        with self.assertRaises(ForbiddenException):
            put_admin_list('character', new_items, do_replace=False, current_user=self.applicant)
        with self.assertRaises(ForbiddenException):
            put_admin_list('character', new_items, do_replace=False, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            put_admin_list('character', new_items, do_replace=False, current_user=self.senior_recruiter)
        self.assertFalse(self.applicant_character.redlisted)
        self.assertFalse(self.not_applicant_character.redlisted)

    def test_admin_list_replace(self):
        new_items = [self.applicant_character.id, self.not_applicant_character.id]
        put_admin_list('character', new_items, do_replace=True, current_user=self.admin)
        new_list = get_admin_list('character', current_user=self.admin)
        self.assertEqual(len(new_list['info']), 2)
        self.assertTrue(self.applicant_character.redlisted)
        self.assertTrue(self.not_applicant_character.redlisted)
        self.assertFalse(self.redlisted_character_1.redlisted)

    def test_forbidden_admin_list_replace(self):
        new_items = [self.applicant_character.id, self.not_applicant_character.id]
        with self.assertRaises(ForbiddenException):
            put_admin_list('character', new_items, do_replace=True, current_user=self.applicant)
        with self.assertRaises(ForbiddenException):
            put_admin_list('character', new_items, do_replace=True, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            put_admin_list('character', new_items, do_replace=True, current_user=self.senior_recruiter)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

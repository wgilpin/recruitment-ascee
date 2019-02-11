import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from models import db, List, ListItem, check_redlist
from base import AsceeTestCase
from flask_app import app
from exceptions import BadRequestException, ForbiddenException
from admin import get_admin_list, add_admin_list_item, remove_admin_list_item


class AdminListTestCase(AsceeTestCase):

    def test_get_check_red_item(self):
        result = check_redlist(1234, 'character')
        self.assertTrue(result)

    def test_get_check_non_red_item(self):
        result = check_redlist(1, 'character')
        self.assertFalse(result)

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
        RED_ID = 8765
        new_item = ListItem(id=RED_ID, name='new person')
        add_admin_list_item('character', new_item, current_user=self.admin)
        new_list = get_admin_list('character', current_user=self.admin)
        self.assertEqual(len(new_list['info']), 3)
        check_result = check_redlist(RED_ID, 'character')
        self.assertTrue(check_result)

        with self.assertRaises(ForbiddenException):
            add_admin_list_item('character', new_item, current_user=self.applicant)
        with self.assertRaises(ForbiddenException):
            add_admin_list_item('character', new_item, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            add_admin_list_item('character', new_item, current_user=self.senior_recruiter)

    def test_remove_admin_list_item(self):
        remove_admin_list_item('character', self.redlist_id_1, current_user=self.admin)
        new_list = get_admin_list('character', current_user=self.admin)
        self.assertEqual(len(new_list['info']), 1)

        with self.assertRaises(BadRequestException):
            remove_admin_list_item('character', self.redlist_id_1, current_user=self.admin)

        with self.assertRaises(ForbiddenException):
            remove_admin_list_item('character', self.redlist_id_2, current_user=self.applicant)
        with self.assertRaises(ForbiddenException):
            remove_admin_list_item('character', self.redlist_id_2, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            remove_admin_list_item('character', self.redlist_id_2, current_user=self.senior_recruiter)



if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

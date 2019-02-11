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
from admin import get_admin_list


class AdminListTestCase(AsceeTestCase):

    def setUp(self):
        super(AdminListTestCase, self).setUp()
        db.session.add(List(id=1, kind='character'))
        db.session.add(ListItem(id=1234, name='First', list_id=1))
        db.session.add(ListItem(id=4321, name='Second', list_id=1))
        db.session.commit()

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




if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

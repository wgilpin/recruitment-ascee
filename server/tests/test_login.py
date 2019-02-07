import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from models import Character, User, Application, db
from base import AsceeTestCase
from flask_app import app
from exceptions import BadRequestException, ForbiddenException
from login import login_helper
import werkzeug


class LoginHelperTests(AsceeTestCase):

    def test_login_helper_login(self):
        with app.test_request_context():
            result = login_helper('login')
            self.assertIsInstance(result, werkzeug.wrappers.Response)
            self.assertEqual(result.status_code, 302)
            redirect_location = result.headers['Location']
            self.assertTrue('login' in redirect_location)

    def test_login_helper_link(self):
        with app.test_request_context():
            result = login_helper('link')
            self.assertIsInstance(result, werkzeug.wrappers.Response)
            self.assertEqual(result.status_code, 302)
            redirect_location = result.headers['Location']
            self.assertTrue('link' in redirect_location)

    def test_login_helper_scopes(self):
        with app.test_request_context():
            result = login_helper('scopes')
            self.assertIsInstance(result, werkzeug.wrappers.Response)
            self.assertEqual(result.status_code, 302)
            redirect_location = result.headers['Location']
            self.assertTrue('scopes' in redirect_location)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

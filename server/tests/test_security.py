import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
import unittest
from security import is_admin, is_recruiter, is_senior_recruiter, is_applicant_character_id, has_applicant_access#, is_applicant_user_id
from models import Character, User, db
from base import AsceeTestCase
from flask_app import app


class AdminSecurityTests(AsceeTestCase):

    def setUp(self):
        super(AdminSecurityTests, self).setUp()
        self.user = self.admin

    def test_is_admin(self):
        self.assertTrue(is_admin(self.user))

    def test_is_recruiter(self):
        self.assertFalse(is_recruiter(self.user))

    def test_is_senior_recruiter(self):
        self.assertFalse(is_senior_recruiter(self.user))

    def test_is_applicant(self):
        self.assertFalse(is_applicant_character_id(self.user.id))

    def test_has_applicant_access(self):
        self.assertFalse(has_applicant_access(self.user, self.applicant))

    def test_has_applicant_self_access(self):
        self.assertFalse(has_applicant_access(self.user, self.applicant, self_access=True))


class RecruiterSecurityTests(AsceeTestCase):

    def setUp(self):
        super(RecruiterSecurityTests, self).setUp()
        self.user = self.recruiter

    def test_is_admin(self):
        self.assertFalse(is_admin(self.user))

    def test_is_recruiter(self):
        self.assertTrue(is_recruiter(self.user))

    def test_is_senior_recruiter(self):
        self.assertFalse(is_senior_recruiter(self.user))

    def test_is_applicant(self):
        self.assertFalse(is_applicant_character_id(self.user.id))

    def test_has_applicant_access(self):
        self.assertTrue(has_applicant_access(self.user, self.applicant))

    def test_has_applicant_self_access(self):
        self.assertTrue(has_applicant_access(self.user, self.applicant, self_access=True))


class OtherRecruiterSecurityTests(RecruiterSecurityTests):

    def setUp(self):
        super(OtherRecruiterSecurityTests, self).setUp()
        self.user = self.other_recruiter

    def test_has_applicant_access(self):
        self.assertFalse(has_applicant_access(self.user, self.applicant))

    def test_has_applicant_self_access(self):
        self.assertFalse(has_applicant_access(self.user, self.applicant, self_access=True))


class SeniorRecruiterSecurityTests(RecruiterSecurityTests):

    def setUp(self):
        super(RecruiterSecurityTests, self).setUp()
        self.user = self.senior_recruiter

    def test_is_senior_recruiter(self):
        self.assertTrue(is_senior_recruiter(self.user))


class ApplicantSecurityTests(AsceeTestCase):

    def setUp(self):
        super(ApplicantSecurityTests, self).setUp()
        self.user = self.applicant

    def test_is_admin(self):
        self.assertFalse(is_admin(self.user))

    def test_is_recruiter(self):
        self.assertFalse(is_recruiter(self.user))

    def test_is_senior_recruiter(self):
        self.assertFalse(is_senior_recruiter(self.user))

    def test_is_applicant(self):
        self.assertTrue(is_applicant_character_id(self.user.id))
        self.assertTrue(is_applicant_user_id(self.user.id))

    def test_has_applicant_access(self):
        self.assertFalse(has_applicant_access(self.user, self.applicant))

    def test_has_applicant_self_access(self):
        self.assertTrue(has_applicant_access(self.user, self.applicant, self_access=True))


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

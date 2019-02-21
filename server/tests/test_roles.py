import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
import unittest
from models import db, Application
from base import AsceeTestCase
from flask_app import app
from exceptions import ForbiddenException, BadRequestException
from admin import set_roles


class SetRolesTests(AsceeTestCase):

    def test_remove_active_recruiter(self):
        response = set_roles(self.recruiter.id, is_recruiter=False, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertIsNone(self.recruiter.recruiter)
        self.assertIsNone(self.application.recruiter_id)
        self.assertTrue(db.session.query(db.exists().where(
            db.and_(
                Application.user_id==self.applicant.id,
                Application.is_concluded==False
            )
        )).scalar())

    def test_promote_active_recruiter_to_senior(self):
        response = set_roles(self.recruiter.id, is_senior_recruiter=True, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertTrue(self.recruiter.recruiter.is_senior)
        self.assertTrue(db.session.query(db.exists().where(
            db.and_(
                Application.user_id==self.applicant.id,
                Application.is_concluded==False
            )
        )).scalar())

    def test_demote_senior_recruiter(self):
        response = set_roles(self.senior_recruiter.id, is_senior_recruiter=False, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertTrue(self.senior_recruiter.recruiter)
        self.assertFalse(self.senior_recruiter.recruiter.is_senior)

    def test_demote_senior_recruiter_explicit(self):
        response = set_roles(self.senior_recruiter.id, is_recruiter=True, is_senior_recruiter=False, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertTrue(self.senior_recruiter.recruiter)
        self.assertFalse(self.senior_recruiter.recruiter.is_senior)

    def test_remove_senior_recruiter(self):
        response = set_roles(self.senior_recruiter.id, is_recruiter=False, is_senior_recruiter=False, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertIsNone(self.senior_recruiter.recruiter)

    def test_switch_recruiter_to_admin(self):
        response = set_roles(self.other_recruiter.id, is_recruiter=False, is_admin=True, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertIsNone(self.other_recruiter.recruiter)
        self.assertTrue(self.other_recruiter.admin)

    def test_promote_user_to_recruiter(self):
        response = set_roles(self.not_applicant.id, is_recruiter=True, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertTrue(self.not_applicant.recruiter)

    def test_promote_user_to_senior_recruiter(self):
        response = set_roles(self.not_applicant.id, is_recruiter=False, is_senior_recruiter=True, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertTrue(self.not_applicant.recruiter)
        self.assertTrue(self.not_applicant.recruiter.is_senior)

    def test_promote_applicant_to_recruiter(self):
        response = set_roles(self.applicant.id, is_recruiter=True, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertTrue(self.applicant.recruiter)
        self.assertTrue(db.session.query(db.exists().where(
            db.and_(
                Application.user_id==self.applicant.id,
                Application.is_concluded==False
            )
        )).scalar())

    def test_demote_admin(self):
        response = set_roles(self.admin.id, is_admin=False, current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertIsNone(self.admin.admin)
        self.assertIsNone(self.admin.recruiter)

    def test_no_recruiter_access(self):
        with self.assertRaises(ForbiddenException):
            set_roles(self.other_recruiter.id, is_recruiter=True, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            set_roles(self.other_recruiter.id, is_recruiter=False, current_user=self.recruiter)

    def test_no_applicant_access(self):
        with self.assertRaises(ForbiddenException):
            set_roles(self.applicant.id, is_admin=True, current_user=self.applicant)

    def test_no_senior_recruiter_access(self):
        with self.assertRaises(ForbiddenException):
            set_roles(self.recruiter.id, is_senior_recruiter=True, current_user=self.senior_recruiter)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

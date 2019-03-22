import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from status import claim_applicant, release_applicant, accept_applicant, reject_applicant, invite_applicant
from models import Character, User, Application, db
from base import AsceeTestCase
from flask_app import app
from exceptions import ForbiddenException, BadRequestException


class ApplicantStatusTests(AsceeTestCase):

    def setUp(self):
        super(ApplicantStatusTests, self).setUp()
        self.application.recruiter_id = None
        db.session.commit()

    def test_claim_applicant(self):
        response = claim_applicant(self.applicant.id, current_user=self.other_recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        application = Application.get_for_user(self.applicant.id)
        self.assertEqual(application.recruiter_id, self.other_recruiter.id)
        self.assertFalse(application.is_concluded)
        self.assertFalse(application.is_submitted)
        self.assertFalse(application.is_accepted)
        self.assertFalse(application.is_invited)

    def test_double_claim_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(BadRequestException):
            claim_applicant(self.applicant.id, current_user=self.recruiter)

    def test_claim_taken_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(BadRequestException):
            claim_applicant(self.applicant.id, current_user=self.other_recruiter)

    def test_not_recruiter_claim_applicant(self):
        with self.assertRaises(ForbiddenException):
            claim_applicant(self.applicant.id, current_user=self.not_applicant)

    def test_claim_not_applicant(self):
        with self.assertRaises(BadRequestException):
            claim_applicant(self.not_applicant.id, current_user=self.recruiter)

    def test_release_applicant(self):
        response = claim_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        response = release_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})

    def test_release_not_applicant(self):
        with self.assertRaises(BadRequestException):
            release_applicant(self.not_applicant.id, current_user=self.recruiter)

    def test_release_applicant_as_other_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            release_applicant(self.applicant.id, current_user=self.other_recruiter)

    def test_release_applicant_as_senior_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        response = release_applicant(self.applicant.id, current_user=self.senior_recruiter)
        self.assertDictEqual(response, {'status': 'ok'})

    def test_release_applicant_as_admin(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            release_applicant(self.applicant.id, current_user=self.admin)

    def test_accept_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        response = accept_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertTrue(self.application.is_accepted)
        self.assertFalse(self.application.is_invited)

    def test_accept_not_applicant(self):
        with self.assertRaises(BadRequestException):
            accept_applicant(self.not_applicant.id, current_user=self.recruiter)

    def test_accept_applicant_as_senior_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        response = accept_applicant(self.applicant.id, current_user=self.senior_recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertTrue(self.application.is_accepted)

    def test_accept_applicant_as_other_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            accept_applicant(self.applicant.id, current_user=self.other_recruiter)

    def test_accept_applicant_as_non_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            accept_applicant(self.applicant.id, current_user=self.not_applicant)

    def test_accept_applicant_as_admin(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            accept_applicant(self.applicant.id, current_user=self.admin)

    def test_reject_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        response = reject_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertFalse(self.application.is_accepted)
        self.assertTrue(self.application.is_concluded)

    def test_reject_not_applicant(self):
        with self.assertRaises(BadRequestException):
            reject_applicant(self.not_applicant.id, current_user=self.recruiter)

    def test_reject_applicant_as_senior_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        response = reject_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertFalse(self.application.is_accepted)
        self.assertTrue(self.application.is_concluded)

    def test_reject_applicant_as_other_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            reject_applicant(self.applicant.id, current_user=self.other_recruiter)

    def test_reject_applicant_as_non_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            reject_applicant(self.applicant.id, current_user=self.not_applicant)

    def test_reject_applicant_as_admin(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            reject_applicant(self.applicant.id, current_user=self.admin)

    def test_invite_accepted_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        invite_applicant(self.applicant.id, current_user=self.senior_recruiter)
        self.assertTrue(self.application.is_accepted)
        self.assertTrue(self.application.is_invited)

    def test_invite_rejected_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        reject_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(BadRequestException):
            invite_applicant(self.applicant.id, current_user=self.senior_recruiter)

    def test_invite_unprocessed_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(BadRequestException):
            invite_applicant(self.applicant.id, current_user=self.senior_recruiter)

    def test_invite_unclaimed_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        release_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(BadRequestException):
            invite_applicant(self.applicant.id, current_user=self.senior_recruiter)

    def test_invite_non_applicant(self):
        with self.assertRaises(BadRequestException):
            invite_applicant(self.not_applicant.id, current_user=self.senior_recruiter)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()
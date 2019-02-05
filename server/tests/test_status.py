import sys
import os
from config import server_dir
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from status import claim_applicant, release_applicant, escalate_applicant, reject_applicant
from models import Character, User, Application, db
from base import AsceeTestCase
from flask_app import app


class ApplicantStatusTests(AsceeTestCase):

  def setUp(self):
        super(ApplicantStatusTests, self).setUp()
        self.user = self.recruiter.user

  def test_claim_applicant(self):
    response = claim_applicant(self.user.id, self.applicant.id)
    self.assertDictEqual(response, {'status': 'ok'})
    application = Application.get_for_user(self.applicant.id)
    self.assertEqual(application.recruiter_id, self.user.id)
    self.assertFalse(application.is_escalated)
    self.assertFalse(application.is_concluded)
    self.assertFalse(application.is_submitted)
    self.assertFalse(application.is_accepted)
    self.assertFalse(application.is_invited)

  def test_not_recruiter_claim_applicant(self):
    response = claim_applicant(self.not_applicant.id, self.applicant.id)
    self.assertIn('error', response)

  def test_release_applicant(self):
    response = claim_applicant(self.user.id, self.applicant.id)
    self.assertDictEqual(response, {'status': 'ok'})
    response = release_applicant(self.user.id, self.applicant.id)
    self.assertDictEqual(response, {'status': 'ok'})

  def test_escalate_applicant(self):
    response = claim_applicant(self.user.id, self.applicant.id)
    self.assertDictEqual(response, {'status': 'ok'})
    application = Application.get_for_user(self.applicant.id)
    self.assertFalse(application.is_escalated)

    response = escalate_applicant(self.applicant.id)
    application = Application.get_for_user(self.applicant.id)
    self.assertTrue(application.is_escalated)

  def test_reject_applicant(self):
    response = claim_applicant(self.user.id, self.applicant.id)
    self.assertDictEqual(response, {'status': 'ok'})
    application = Application.get_for_user(self.applicant.id)
    self.assertFalse(application.is_accepted)
    self.assertFalse(application.is_concluded)

    response = reject_applicant(self.applicant.id)
    self.assertDictEqual(response, {'status': 'ok'})
    application = Application.get_for_user(self.applicant.id)
    self.assertFalse(application.is_accepted)
    self.assertTrue(application.is_concluded)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()
import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from status import claim_applicant, release_applicant, accept_applicant, reject_applicant,\
    invite_applicant, own_application_status, unaccept_applicant
from recruitment import get_applicant_list
from models import Character, User, Application, db
from base import AsceeTestCase
from flask_app import app
from exceptions import ForbiddenException, BadRequestException
from ia import get_recently_invited_applicants


class OwnApplicationStatusTests(AsceeTestCase):

    def test_not_applicant_status(self):
        result = own_application_status(self.not_applicant)
        self.assertEqual(result, {'status': 'none'})

    def test_applicant_status(self):
        self.application.is_submitted = True
        db.session.commit()
        result = own_application_status(self.applicant)
        self.assertEqual(result, {'status': 'submitted'})

    def test_recruiter_status(self):
        result = own_application_status(self.recruiter)
        self.assertEqual(result, {'status': 'none'})

    def test_unsubmitted_status(self):
        self.application.is_submitted = False
        db.session.commit()
        result = own_application_status(self.applicant)
        self.assertEqual(result, {'status': 'unsubmitted'})
        
        
class ApplicantListTests(AsceeTestCase):

    def test_no_applicants_listed_with_no_submitted_apps(self):
        self.application.is_submitted = False
        db.session.commit()
        applicant_list = get_applicant_list(current_user=self.recruiter)['info']
        self.assertEqual(len(applicant_list), 0)
        applicant_list = get_applicant_list(current_user=self.senior_recruiter)['info']
        self.assertEqual(len(applicant_list), 0)

    def test_no_applicants_listed_with_invited_app(self):
        self.application.is_submitted = True
        self.application.is_accepted = True
        self.application.is_concluded = True
        self.application.is_invited = True
        db.session.commit()
        applicant_list = get_applicant_list(current_user=self.recruiter)['info']
        self.assertEqual(len(applicant_list), 0)
        applicant_list = get_applicant_list(current_user=self.senior_recruiter)['info']
        self.assertEqual(len(applicant_list), 0)

    def test_applicant_listed_after_submission(self):
        self.application.is_submitted = True
        self.application.recruiter_id = None
        db.session.commit()
        applicant_list = get_applicant_list(current_user=self.recruiter)['info']
        self.assertEqual(len(applicant_list), 1)
        self.assertIn(self.application.user_id, applicant_list)
        self.assertEqual(applicant_list[self.application.user_id]['status'], 'new')
        applicant_list = get_applicant_list(current_user=self.senior_recruiter)['info']
        self.assertEqual(len(applicant_list), 1)
        self.assertIn(self.application.user_id, applicant_list)
        self.assertEqual(applicant_list[self.application.user_id]['status'], 'new')

    def test_applicant_listed_after_claiming(self):
        self.application.is_submitted = True
        self.application.recruiter_id = None
        db.session.commit()
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        applicant_list = get_applicant_list(current_user=self.recruiter)['info']
        self.assertEqual(len(applicant_list), 1)
        self.assertIn(self.application.user_id, applicant_list)
        self.assertEqual(applicant_list[self.application.user_id]['status'], 'claimed')
        applicant_list = get_applicant_list(current_user=self.senior_recruiter)['info']
        self.assertEqual(len(applicant_list), 1)
        self.assertIn(self.application.user_id, applicant_list)
        self.assertEqual(applicant_list[self.application.user_id]['status'], 'claimed')

    def test_applicant_list_after_acceptance(self):
        self.application.is_submitted = True
        db.session.commit()
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        applicant_list = get_applicant_list(current_user=self.recruiter)[
            'info']
        self.assertEqual(len(applicant_list), 1)
        self.assertIn(self.application.user_id, applicant_list)
        self.assertEqual(applicant_list[self.application.user_id]['status'],
                         'accepted')
        applicant_list = get_applicant_list(current_user=self.senior_recruiter)['info']
        self.assertEqual(len(applicant_list), 1)
        self.assertIn(self.application.user_id, applicant_list)
        self.assertEqual(applicant_list[self.application.user_id]['status'],
                         'accepted')

    def test_applicant_list_after_invitation(self):
        self.application.is_submitted = True
        db.session.commit()
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertTrue(self.application.is_accepted)
        self.assertTrue(self.application.is_concluded)
        invite_applicant(self.applicant.id, current_user=self.senior_recruiter)
        applicant_list = get_applicant_list(current_user=self.recruiter)[
            'info']
        self.assertEqual(len(applicant_list), 0)
        applicant_list = get_applicant_list(current_user=self.senior_recruiter)['info']
        self.assertEqual(len(applicant_list), 0)

    def test_applicant_list_after_rejection(self):
        self.application.is_submitted = True
        db.session.commit()
        reject_applicant(self.applicant.id, current_user=self.recruiter)
        applicant_list = get_applicant_list(current_user=self.recruiter)[
            'info']
        self.assertEqual(len(applicant_list), 0)
        applicant_list = get_applicant_list(current_user=self.senior_recruiter)['info']
        self.assertEqual(len(applicant_list), 0)


class ApplicantStatusTests(AsceeTestCase):

    def setUp(self):
        super(ApplicantStatusTests, self).setUp()
        self.application.recruiter_id = None
        db.session.commit()

    def test_claim_applicant(self):
        application = Application.get_for_user(self.applicant.id)
        self.assertEqual(len(application.notes), 0)
        response = claim_applicant(self.applicant.id, current_user=self.other_recruiter)
        self.assertEqual(len(application.notes), 1)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertEqual(application.recruiter_id, self.other_recruiter.id)
        self.assertFalse(application.is_concluded)
        self.assertFalse(application.is_accepted)
        self.assertFalse(application.is_invited)

    def test_double_claim_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(BadRequestException):
            claim_applicant(self.applicant.id, current_user=self.recruiter)

    def test_claim_unsubmitted_applicant(self):
        self.application.is_submitted = False
        db.session.commit()
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
        self.assertEqual(len(self.application.notes), 0)
        response = claim_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertEqual(len(self.application.notes), 1)
        response = release_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertEqual(len(self.application.notes), 2)

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

    def test_unaccept_applicant(self):
        self.assertEqual(len(self.application.notes), 0)
        response = claim_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertEqual(len(self.application.notes), 1)
        response = accept_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertTrue(self.application.is_accepted)
        response = unaccept_applicant(self.applicant.id, current_user=self.senior_recruiter)
        self.assertFalse(self.application.is_accepted)
        self.assertEqual(self.application.recruiter_id, self.recruiter.id)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertEqual(len(self.application.notes), 3)

    def test_release_not_applicant(self):
        with self.assertRaises(BadRequestException):
            unaccept_applicant(self.not_applicant.id, current_user=self.senior_recruiter)

    def test_unaccept_before_accept(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            unaccept_applicant(self.applicant.id, current_user=self.senior_recruiter)

    def test_reject_unaccept_applicant_as_other_recruiter(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            unaccept_applicant(self.applicant.id, current_user=self.other_recruiter)

    def test_reject_unaccept_applicant_as_admin(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            unaccept_applicant(self.applicant.id, current_user=self.admin)
    
    def test_reject_unaccept_applicant_as_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            unaccept_applicant(self.applicant.id, current_user=self.applicant)

    def test_reject_unaccept_applicant_as_not_applicant(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            unaccept_applicant(self.applicant.id, current_user=self.not_applicant)

    def test_accept_applicant(self):
        self.assertEqual(len(self.application.notes), 0)
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertEqual(len(self.application.notes), 1)
        response = accept_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertEqual(len(self.application.notes), 2)
        self.assertTrue(self.application.is_accepted)
        self.assertTrue(self.application.is_concluded)
        self.assertFalse(self.application.is_invited)

    def test_recruiter_reject_accepted_applicant_forbidden(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            reject_applicant(self.applicant.id, current_user=self.recruiter)

    def test_sr_reject_accepted_applicant(self):
        self.assertEqual(len(self.application.notes), 0)
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertEqual(len(self.application.notes), 1)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        self.assertEqual(len(self.application.notes), 2)
        response = reject_applicant(self.applicant.id, current_user=self.senior_recruiter)
        self.assertEqual(len(self.application.notes), 3)
        self.assertDictEqual(response, {'status': 'ok'})
        self.assertFalse(self.application.is_accepted)
        self.assertTrue(self.application.is_concluded)
        self.assertFalse(self.application.is_invited)

    def test_sr_reject_invited_applicant_forbidden(self):
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        invite_applicant(self.applicant.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            reject_applicant(self.applicant.id, current_user=self.senior_recruiter)

    def test_accept_not_applicant(self):
        with self.assertRaises(ForbiddenException):
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
        with self.assertRaises(ForbiddenException):
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

    def test_invited_is_recently_invited(self):
        response = get_recently_invited_applicants(current_user=self.admin)
        self.assertEqual(len(response['info']), 0)
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        response = get_recently_invited_applicants(current_user=self.admin)
        self.assertEqual(len(response['info']), 0)
        invite_applicant(self.applicant.id, current_user=self.senior_recruiter)
        response = get_recently_invited_applicants(current_user=self.admin)
        self.assertEqual(len(response['info']), 1)
        self.assertEqual(response['info'][0]['user_id'], self.applicant.id)
        self.assertEqual(response['info'][0]['user_name'], self.applicant.name)
        self.assertEqual(response['info'][0]['recruiter_id'], self.recruiter.id)
        self.assertEqual(response['info'][0]['recruiter_name'], self.recruiter.name)
        self.assertIsInstance(response['info'][0]['last_note_time'], str)

    def test_recently_invited_applicants_forbidden(self):
        for user in (self.applicant, self.not_applicant, self.recruiter, self.senior_recruiter):
            with self.assertRaises(ForbiddenException):
                get_recently_invited_applicants(current_user=user)

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
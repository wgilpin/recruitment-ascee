import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

from flask_app import app
from models import db
from base import AsceeTestCase
from exceptions import BadRequestException, ForbiddenException
from images import get_user_images, get_application_images, sign_s3, confirm_s3
import unittest


class ImagesTests(AsceeTestCase):

    def test_get_user_images_forbidden(self):
        for user in (self.applicant, self.other_recruiter, self.not_applicant):
            with self.assertRaises(ForbiddenException):
                get_user_images(self.applicant.id, current_user=user)
        for user in (self.applicant, self.other_recruiter, self.not_applicant, self.recruiter, self.admin):
            with self.assertRaises(ForbiddenException):
                get_user_images(self.not_applicant.id, current_user=user)
            with self.assertRaises(ForbiddenException):
                get_user_images(self.recruiter.id, current_user=user)

    def test_get_application_images_forbidden(self):
        for user in (self.applicant, self.other_recruiter, self.not_applicant):
            with self.assertRaises(ForbiddenException):
                get_application_images(self.application.id, current_user=user)

    def test_get_user_images_empty(self):
        response = get_user_images(self.applicant.id, current_user=self.recruiter)
        self.assertEqual(response, {'info': []})

    def test_get_user_images_as_applicant_empty(self):
        self.application.is_submitted = False
        db.session.commit()
        response = get_user_images(self.applicant.id, current_user=self.applicant)
        self.assertEqual(response, {'info': []})

    def test_sign_s3_forbidden(self):
        for user in (self.not_applicant, self.recruiter, self.senior_recruiter, self.admin, self.applicant):
            with self.assertRaises(ForbiddenException):
                sign_s3(current_user=user)

    def test_sign_s3(self):
        self.application.is_submitted = False
        db.session.commit()
        self.assertEqual(len(self.application.images), 0)
        response = sign_s3(current_user=self.applicant)
        data = response['info']
        self.assertEqual(len(data), 3)
        for name in ('url', 'data'):
            self.assertIn(name, data)
            self.assertIsInstance(data[name], str)
        self.assertIn('image_id', data)
        self.assertIsInstance(data['image_id'], int)
        self.assertEqual(len(self.application.images), 1)
        image = self.application.images[0]
        self.assertEqual(image.is_confirmed, False)

    def test_sign_and_confirm_s3(self):
        self.application.is_submitted = False
        db.session.commit()
        self.assertEqual(len(self.application.images), 0)
        response = sign_s3(current_user=self.applicant)
        data = response['info']
        self.assertEqual(len(data), 3)
        for name in ('url', 'data'):
            self.assertIn(name, data)
            self.assertIsInstance(data[name], str)
        self.assertIn('image_id', data)
        self.assertIsInstance(data['image_id'], int)
        self.assertEqual(len(self.application.images), 1)
        image = self.application.images[0]
        self.assertFalse(image.is_confirmed)
        response = confirm_s3(image.id, current_user=self.applicant)
        self.assertEqual(response, {'status': 'ok'})
        self.assertTrue(image.is_confirmed)

    def test_confirm_s3_forbidden(self):
        self.application.is_submitted = False
        db.session.commit()
        self.assertEqual(len(self.application.images), 0)
        response = sign_s3(current_user=self.applicant)
        data = response['info']
        self.assertEqual(len(data), 3)
        for name in ('url', 'data'):
            self.assertIn(name, data)
            self.assertIsInstance(data[name], str)
        self.assertIn('image_id', data)
        self.assertIsInstance(data['image_id'], int)
        self.assertEqual(len(self.application.images), 1)
        image = self.application.images[0]
        self.assertFalse(image.is_confirmed)
        for user in (self.not_applicant, self.recruiter, self.senior_recruiter, self.admin):
            with self.assertRaises(ForbiddenException):
                confirm_s3(image.id, current_user=user)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

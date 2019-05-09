import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

from flask_app import app
from models import db
from base import AsceeTestCase
from exceptions import BadRequestException, ForbiddenException
from images import get_user_images, get_application_images
import unittest


class ImagesTests(AsceeTestCase):

    def test_get_user_images_forbidden(self):
        with self.assertRaises(ForbiddenException):
            get_user_images(self.applicant.id, current_user=self.not_applicant)
        for user in (self.not_applicant, self.recruiter, self.admin):
            with self.assertRaises(ForbiddenException):
                get_user_images(self.not_applicant.id, current_user=user)
            with self.assertRaises(ForbiddenException):
                get_user_images(self.recruiter.id, current_user=user)

    def test_get_application_images_forbidden(self):
        with self.assertRaises(ForbiddenException):
            get_application_images(self.application.id, current_user=self.not_applicant)

    def test_get_user_images_empty(self):
        response = get_user_images(self.applicant.id, current_user=self.recruiter)
        self.assertEqual(response, {'info': []})

    def test_get_user_images_as_applicant_empty(self):
        self.application.is_submitted = False
        db.session.commit()
        response = get_user_images(self.applicant.id, current_user=self.applicant)
        self.assertEqual(response, {'info': []})

if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

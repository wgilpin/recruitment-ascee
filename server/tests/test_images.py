import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

from flask_app import app
from models import db, Image
from base import AsceeTestCase
from exceptions import BadRequestException, ForbiddenException
from images import get_user_images, get_application_images, delete_s3, upload_image
import unittest


class ImagesTests(AsceeTestCase):

    def test_delete_image_forbidden(self):
        upload_image(current_user=self.applicant)
        image_id, = db.session.query(Image.id).filter(Image.application_id == self.application.id).one()
        for user in (self.not_applicant, self.recruiter, self.senior_recruiter):
            with self.assertRaises(ForbiddenException):
                delete_s3(image_id, current_user=user)
        self.application.submitted = True
        with self.assertRaises(ForbiddenException):
            delete_s3(image_id, current_user=self.applicant)

    def test_upload_image_forbidden(self):
        for user in (self.not_applicant, self.recruiter, self.senior_recruiter, self.admin):
            with self.assertRaises(ForbiddenException):
                upload_image(current_user=user)

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

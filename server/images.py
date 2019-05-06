import os
from models import db, Application, User, Image
from exceptions import ForbiddenException, BadRequestException, AppException
from security import user_application_access_check
from esi_config import aws_bucket_name, aws_endpoint_url, aws_region_name, aws_signature_version
from flask_app import app
from flask import request
import boto3
from botocore.client import Config


def get_user_images(user_id, current_user=None):
    if user_id == None:
        user_id = current_user.id
    application = Application.get_for_user(user_id)
    user = User.get(user_id)
    if application is None:
        raise ForbiddenException(
            'User {} does not have access.'.format(current_user.id)
        )
    elif application.user == current_user:
        if application.is_concluded:
            raise ForbiddenException(
                'User {} does not have access.'.format(current_user.id)
            )
    else:
        user_application_access_check(current_user, user)
    return {'info': [{'url': image.url, 'id': image.filename} for image in application.images]}


def get_application_images(application_id, current_user=None):
    application = Application.query.get(application_id)
    if application is None:
        raise ForbiddenException(
            'User {} does not have access.'.format(
                current_user.id
            )
        )
    else:
        return get_user_images(application.user.id, current_user=current_user)

def upload_image(current_user=None):
    application = Application.get_for_user(current_user.id)
    if application is None:
        raise ForbiddenException(
            'User {} does not have access.'.format(
                current_user.id
            )
        )
    else:
        if app.config.get('TESTING'):
            presigned_post = 'placeholder for presigned_post'
        else:
            s3 = boto3.client(
                's3',
                region_name=aws_region_name,
                endpoint_url=aws_endpoint_url,
                config=Config(signature_version=aws_signature_version),
            )
            for key, file in request.files.items():
                if file.filename == "":
                    raise BadRequestException("No file selected");

                image = Image(application_id=application.id)
                db.session.add(image)
                db.session.commit()

                if file and file.filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                    s3.upload_fileobj(
                        file,
                        aws_bucket_name,
                        image.filename,
                        ExtraArgs={
                            "ACL": 'public-read',
                            "ContentType": file.content_type
                        }
                    )
                else:
                    raise AppException('File storage failed')

            return {'status': 'ok'}


def confirm_s3(image_id, current_user=None):
    image = Image.query.get(image_id)
    if image is None or image.is_confirmed or image.application.user_id != current_user.id:
        raise ForbiddenException(
            'User {} does not have access.'.format(
                current_user.id
            )
        )
    else:
        image.is_confirmed = True
        db.session.commit()
        return {'status': 'ok'}

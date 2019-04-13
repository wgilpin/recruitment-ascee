from models import db, Application, User, Image
from exceptions import ForbiddenException, BadRequestException
from security import user_application_access_check
from esi_config import aws_bucket_name
from flask_app import app
import boto3


def get_user_images(user_id, current_user=None):
    application = Application.get_for_user(user_id)
    user = User.get(user_id)
    if application is None:
        raise ForbiddenException(
            'User {} does not have access.'.format(current_user.id)
        )
    elif application.user == current_user:
        if application.is_submitted:
            raise ForbiddenException(
                'User {} does not have access.'.format(current_user.id)
            )
    else:
        user_application_access_check(current_user, user)
    return {'info': [image.url for image in application.images]}


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


def sign_s3(current_user=None):
    application = Application.get_for_user(current_user.id)
    if application is None or application.is_submitted:
        raise ForbiddenException(
            'User {} does not have access.'.format(
                current_user.id
            )
        )
    else:
        image = Image(application_id=application.id)
        db.session.add(image)
        db.session.commit()
        file_name = str(image.id)
        if app.config.get('TESTING'):
            presigned_post = 'placeholder for presigned_post'
        else:
            s3 = boto3.client('s3')
            presigned_post = s3.generate_presigned_post(
                Bucket=aws_bucket_name,
                Key=file_name,
                Fields={"acl": "public-read", "Content-Type": 'image'},
                Conditions=[
                    {"acl": "public-read"},
                    {"Content-Type": 'image'}
                ],
                ExpiresIn=3600,
            )
        return {
            'info': {
                'image_id': image.id,
                'data': presigned_post,
                'url': f'https://{aws_bucket_name}.s3.amazonaws.com/{file_name}',
            }
        }


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


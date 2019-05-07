from models import User, Character, Admin, Recruiter, Application, db
from exceptions import ForbiddenException, BadRequestException, UnauthorizedException
from functools import wraps
from flask_login import current_user
import boto3


def login_required(func):
    @wraps(func)
    def decorated(*args, **kwargs):
        if not current_user.is_authenticated:
            raise UnauthorizedException('Login required')
        else:
            return func(*args, **kwargs)
    return decorated


def is_admin(user):
    return (user is not None) and isinstance(user.admin, Admin)


def is_recruiter(user):
    return (user is not None) and isinstance(user.recruiter, Recruiter)


def is_senior_recruiter(user):
    return (user is not None) and isinstance(user.recruiter, Recruiter) and user.recruiter.is_senior


def is_applicant_user_id(user_id):
    user = db.session.query(User).filter(
        User.id == user_id
    ).join(
        Application, Application.user_id == User.id,
    ).filter(
        db.or_(
            db.not_(Application.is_concluded),
            db.and_(Application.is_accepted, db.not_(Application.is_invited))
        )
    ).one_or_none()
    return user is not None


def is_applicant_character_id(character_id):
    base = db.session.query(Character).filter(
        Character.id == character_id,
    )
    character = base.join(
        User, User.id == Character.user_id
    ).join(
        Application, Application.user_id == User.id,
    ).filter(
        db.or_(
            db.not_(Application.is_concluded),
            db.and_(Application.is_accepted, db.not_(Application.is_invited))
        )
    ).first()
    return character is not None


def character_application_access_check(current_user, target_character, write=False):
    if not has_applicant_access(current_user, target_character.user, write=write):
        raise ForbiddenException(
            'User {} does not have access.'.format(
                current_user.id
            )
        )


def user_admin_access_check(current_user):
    if not is_admin(current_user):
        raise ForbiddenException(
            'User {} does not have access.'.format(
                current_user.id
            )
        )


def user_application_access_check(current_user, target_user, write=True):
    if not has_applicant_access(current_user, target_user, write=write):
        raise ForbiddenException(
            'User {} does not have access.'.format(
                current_user.id
            )
        )


def has_applicant_access(user, target_user, self_access=False, write=True):
    if self_access and (user.id == target_user.id):
        return True
    elif not is_recruiter(user):
        return False
    else:
        return_value = False
        application = Application.get_for_user(target_user.id)
        if application:
            if application.recruiter_id == user.id and not application.is_concluded:
                # Requesting user is recruiter who claimed application
                return_value = True
            elif is_senior_recruiter(user):
                return True
            elif not application.recruiter_id:
                # unclaimed application
                return_value = True
            elif not write:
                return_value = True  # all recruiters can read
        return return_value

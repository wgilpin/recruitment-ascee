from flask_app import app
from flask_login import login_required, current_user
from flask import jsonify
from security import user_application_access_check, is_recruiter, is_senior_recruiter
from models import User, Character, Application
from models.database import db
from security import has_applicant_access
from exceptions import BadRequestException, ForbiddenException, NotAcceptableException



def claim_applicant(applicant_user_id, current_user=current_user):
    application = Application.get_for_user(applicant_user_id)
    if application is None:
        raise NotAcceptableException(
            'User {} is not in an open application.'.format(
                applicant_user_id
            )
        )
    elif application.recruiter_id is not None:
        raise BadRequestException(
            'User {} has already been claimed by a recruiter.'.format(
                applicant_user_id
            )
        )
    elif not is_recruiter(current_user):
        raise ForbiddenException('User {} is not a recruiter'.format(current_user.id))
    else:
        application.recruiter_id = current_user.id
        db.session.commit()
        return {'status': 'ok'}

def deescalate_applicant(applicant_user_id, current_user=current_user):
    application = Application.get_for_user(applicant_user_id)
    if application is None:
        raise NotAcceptableException(
            'User {} is not in an open application.'.format(
                applicant_user_id
            )
        )
    elif not application.recruiter_id:
        raise BadRequestException(
            'User {} has not been claimed by a recruiter.'.format(
                applicant_user_id
            )
        )
    elif not is_recruiter(current_user) and not is_senior_recruiter(current_user):
        raise ForbiddenException('User {} is not a recruiter'.format(current_user.id))
    else:
        application.is_escalated = False
        db.session.commit()
        return {'status': 'ok'}


def release_applicant(applicant_user_id, current_user=current_user):
    application = Application.get_for_user(applicant_user_id)
    if application is None:
        raise BadRequestException(
            'User {} is not in an open application.'.format(
                applicant_user_id
            )
        )
    elif not has_applicant_access(current_user, User.get(applicant_user_id)):
        raise ForbiddenException('User {} does not have access to user {}'.format(
            current_user.id, applicant_user_id
        ))
    else:
        application.recruiter_id = None
        db.session.commit()
        return {'status': 'ok'}


def escalate_applicant(applicant_user_id, current_user=current_user):
    applicant = User.get(applicant_user_id)
    user_application_access_check(current_user, applicant)
    application = Application.get_for_user(applicant_user_id)
    application.is_escalated = True
    db.session.commit()
    return {'status': 'ok'}


def reject_applicant(applicant_user_id, current_user=current_user):
    applicant = User.get(applicant_user_id)
    user_application_access_check(current_user, applicant)
    application = Application.get_for_user(applicant_user_id)
    application.is_concluded = True
    application.is_accepted = False
    db.session.commit()
    return {'status': 'ok'}


def accept_applicant(applicant_user_id, current_user=current_user):
    applicant = User.get(applicant_user_id)
    user_application_access_check(current_user, applicant)
    application = Application.get_for_user(applicant_user_id)
    application.is_accepted = True
    application.is_concluded = True
    db.session.commit()
    return {'status': 'ok'}

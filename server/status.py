from flask_app import app
from flask_login import login_required, current_user
from flask import jsonify
from security import user_application_access_check, is_recruiter, \
    is_senior_recruiter, is_admin
from models import User, Character, Application, db, Note
from models.database import db
from security import has_applicant_access
from exceptions import BadRequestException, ForbiddenException
from mail import send_mail


def own_application_status(current_user):
    application = Application.get_for_user(current_user.id)
    if application is None:
        status = 'none'
    elif application.is_submitted:
        status = 'submitted'
    else:
        status = 'unsubmitted'
    return {'status': status}


def claim_applicant(applicant_user_id, current_user=current_user):
    if not is_recruiter(current_user):
        raise ForbiddenException('User {} is not a recruiter'.format(current_user.id))
    application = Application.get_submitted_for_user(applicant_user_id)
    if application is None:
        raise BadRequestException(
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
    else:
        application.recruiter_id = current_user.id
        db.session.commit()
        add_status_note(application, 'Application claimed by {}.'.format(current_user.name))
        return {'status': 'ok'}

def release_applicant(applicant_user_id, current_user=current_user):
    if not (is_recruiter(current_user) or is_senior_recruiter(current_user)):
        raise ForbiddenException('User {} is not a recruiter'.format(current_user.id))
    application = Application.get_submitted_for_user(applicant_user_id)
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
        if is_senior_recruiter(current_user):
            add_status_note(application, 'Application un-accepted by {}.'.format(current_user.name))
            application.is_accepted = False
            application.is_concluded = False
        elif is_recruiter(current_user):
            add_status_note(application, 'Application released by {}.'.format(current_user.name))
            application.recruiter_id = None
        db.session.commit()
        return {'status': 'ok'}


def reject_applicant(applicant_user_id, current_user=current_user):
    applicant = User.get(applicant_user_id)
    user_application_access_check(current_user, applicant)
    send_mail(applicant.id, 'reject')
    application = Application.get_submitted_for_user(applicant_user_id)
    application.is_concluded = True
    application.is_accepted = False
    db.session.commit()
    add_status_note(application, 'Application rejected by {}.'.format(current_user.name))
    return {'status': 'ok'}


def accept_applicant(applicant_user_id, current_user=current_user):
    applicant = User.get(applicant_user_id)
    user_application_access_check(current_user, applicant)
    application = Application.get_submitted_for_user(applicant_user_id)
    application.is_accepted = True
    application.is_concluded = True
    db.session.commit()
    add_status_note(application, 'Application accepted by {}.'.format(current_user.name))
    return {'status': 'ok'}


def invite_applicant(applicant_user_id, current_user=current_user):
    if not is_senior_recruiter(current_user):
        raise ForbiddenException('User {} cannot invite applicants.'.format(current_user.id))
    else:
        application = Application.get_submitted_for_user(applicant_user_id)
        if application is None:
            raise BadRequestException(
                'User {} is not in an open application.'.format(
                    applicant_user_id
                )
            )
        elif not application.is_accepted:
            raise BadRequestException(
                'User {} application is not accepted.'.format(
                    applicant_user_id
                )
            )
        elif application.is_invited:
            raise BadRequestException(
                'User {} application is already invited.'.format(
                    applicant_user_id
                )
            )
        else:
            send_mail(applicant_user_id, 'invite')
            application.is_invited = True
            db.session.commit()
            add_status_note(application, 'Application invited by {}.'.format(current_user.name))


def submit_application(current_user=None):
    application = Application.get_for_user(current_user.id)
    if not application:
        raise BadRequestException(f'User {current_user.id} is not an applicant.')
    application.is_submitted = True
    db.session.commit()
    add_status_note(application, 'Application submitted.')
    return {'status': 'ok'}


def start_application(current_user=None):
    if is_admin(current_user) or is_recruiter(current_user) or is_senior_recruiter(current_user):
        raise BadRequestException('Recruiters cannot apply')
    character = Character.get(current_user.id)
    if character.blocked_from_applying:
        raise ForbiddenException('User is blocked')
    application = Application.get_for_user(current_user.id)
    if application:
        raise BadRequestException('An application is already open')
    # no application, start one
    application = Application(user_id=current_user.id, is_concluded=False)
    db.session.add(application)
    db.session.commit()
    add_status_note(application, 'Application created.')
    return {'status': 'ok'}


def add_status_note(application, text):
    note = Note(
        text=text,
        title=None,
        application_id=application.id,
        is_chat_log=False,
        author_id=application.user_id,
    )
    db.session.add(note)
    db.session.commit()


def get_application_status(application):
    if application.is_concluded and not application.is_accepted:
        status = 'rejected'
    elif application.is_accepted and not application.is_invited:
        status = 'accepted'
    elif application.is_invited:
        status = 'invited'
    elif application.recruiter is not None:
        status = 'claimed'
    elif application.is_submitted:
        status = 'submitted'
    else:
        status = 'new'
    return status
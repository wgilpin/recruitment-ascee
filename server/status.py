from flask_app import app
from flask_login import login_required, current_user
from flask import jsonify
from security import user_application_access_check, is_recruiter
from models import User, Character, Application
from models.database import db
from security import has_applicant_access
from exceptions import BadRequestException, ForbiddenException


@app.route(
    '/api/recruits/claim/<int:applicant_id>', methods=['GET'])
@login_required
def api_claim_applicant(applicant_id):
    """
    Assigns recruiter as the recruiter for a given unclaimed applicant.

    Args:
        applicant_id (int): User key of applicant

    Returns:
        {'status': 'ok'} if applicant is successfully claimed

    Error codes:
        Forbidden (403): If recruiter_id is not a recruiter, or logged in user
            is not an admin, senior recruiter, or this particular recruiter
        Bad Request (400): If applicant_id is not an unclaimed applicant
    """
    return jsonify(claim_applicant(applicant_id, current_user=current_user))


@app.route(
    '/api/recruits/release/<int:applicant_id>', methods=['GET'])
@login_required
def api_release_applicant(applicant_id):
    """
    Releases the claimed applicant from being claimed by a given recruiter.

    Args:
        applicant_id (int): User key of applicant claimed by recruiter

    Returns:
        {'status': 'ok'} if applicant is successfully released

    Error codes:
        Forbidden (403): If recruiter_id is not a recruiter, or logged in user
            is not an admin, senior recruiter, or this particular recruiter
        Bad Request (400): If applicant_id
            is not an applicant claimed by the recruiter
    """
    return jsonify(release_applicant(applicant_id, current_user=current_user))


@app.route(
    '/api/recruits/escalate/<int:applicant_id>', methods=['GET'])
@login_required
def api_escalate_applicant(applicant_id):
    """
    Sets a new applicant's status to "escalated".

    Args:
        applicant_id (int): User key of applicant

    Returns:
        {'status': 'ok'} if applicant is successfully escalated

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant with "new" status
    """
    return jsonify(escalate_applicant(applicant_id, current_user=current_user))


@app.route(
    '/api/recruits/escalate/<int:applicant_id>', methods=['GET'])
@login_required
def api_accept_applicant(applicant_id):
    """
    Sets a new applicant's status to "accepted".

    Args:
        applicant_id (int): User key of applicant

    Returns:
        {'status': 'ok'} if applicant is successfully accepted

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant with "new" status
    """
    return jsonify(accept_applicant(applicant_id, current_user=current_user))


@app.route('/api/recruits/reject/<int:applicant_id>', methods=['GET'])
def api_reject_applicant(applicant_id):
    """
    Sets an applicant's status to "rejected".

    Args:
        applicant_id (int): User key of applicant

    Returns:
        {'status': 'ok'} if applicant is successfully rejected

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
    return jsonify(reject_applicant(applicant_id, current_user=current_user))


def claim_applicant(applicant_user_id, current_user=current_user):
    application = Application.get_for_user(applicant_user_id)
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
    elif not is_recruiter(current_user):
        raise ForbiddenException('User {} is not a recruiter'.format(current_user.id))
    else:
        application.recruiter_id = current_user.id
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

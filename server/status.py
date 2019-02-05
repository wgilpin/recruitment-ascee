from flask_app import app
from flask_login import login_required, current_user
from flask import jsonify
from security import ensure_has_access, is_recruiter
from models import User, Character, Application
from models.database import db


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
    # TODO: be sure to check that the applicant is in fact an unclaimed applicant
    return jsonify(recruiter_claim_applicant(current_user.get_id(), applicant_id))


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
    ensure_has_access(current_user.get_id(), applicant_id)
    return recruiter_release_applicant(current_user.get_id(), applicant_id)


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
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(escalate_applicant(applicant_id))


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
    ensure_has_access(current_user.get_id(), applicant_id)
    return jsonify(reject_applicant(applicant_id))



def claim_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    if not is_recruiter(recruiter):
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'User {} is not a recruiter'.format(recruiter_name)}
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    application = Application.get_for_user(applicant_user_id)
    application.recruiter_id = recruiter_user_id
    application.is_escalated = False
    application.is_concluded = False
    application.is_accepted = False
    application.is_invited = False
    db.session.commit()
    return {'status': 'ok'}


def release_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    applicant = User.get(applicant_user_id)
    if not is_recruiter(recruiter):
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'User {} is not a recruiter'.format(recruiter_name)}
    elif applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    application = Application.get_for_user(applicant_user_id)
    if application.recruiter_id != recruiter_user_id:
        applicant_name = Character.get(applicant_user_id).name
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'Recruiter {} is not recruiter for applicant {}'.format(
            recruiter_name, applicant_name)}
    else:
        application.recruiter_id = None
        db.session.commit()
        return {'status': 'ok'}


def escalate_applicant(applicant_user_id):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    application = Application.get_for_user(applicant_user_id)
    application.is_escalated = True
    db.session.commit()
    return {'status': 'ok'}


def reject_applicant(applicant_user_id):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    application = Application.get_for_user(applicant_user_id)
    application.is_concluded = True
    application.is_accepted = False
    db.session.commit()
    return {'status': 'ok'}

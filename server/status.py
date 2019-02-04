from flask_app import app
from flask_login import login_required, current_user
from flask import jsonify
from security import ensure_has_access
from models import User, Character


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



def recruiter_claim_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    if not recruiter.is_recruiter:
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'User {} is not a recruiter'.format(recruiter_name)}
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    applicant.recruiter_id = recruiter_user_id
    db.session.commit()
    return {'status': 'ok'}


def recruiter_release_applicant(recruiter_user_id, applicant_user_id):
    recruiter = User.get(recruiter_user_id)
    applicant = User.get(applicant_user_id)
    if not recruiter.is_recruiter:
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'User {} is not a recruiter'.format(recruiter_name)}
    elif applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    elif applicant.recruiter_id != recruiter_user_id:
        applicant_name = Character.get(applicant_user_id).name
        recruiter_name = Character.get(recruiter_user_id).name
        return {'error': 'Recruiter {} is not recruiter for applicant {}'.format(
            recruiter_name, applicant_name)}
    else:
        applicant.recruiter_id = None
        db.session.commit()
        return {'status': 'ok'}


def escalate_applicant(applicant_user_id):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        applicant.status = 'escalated'
        db.session.commit()
        return {'new_applicant_status': applicant.status}


def reject_applicant(applicant_user_id):
    applicant = User.get(applicant_user_id)
    if applicant is None:
        applicant_name = Character.get(applicant_user_id).name
        return {'error': 'User {} is not an applicant'.format(applicant_name)}
    else:
        applicant.status = 'rejected'
        db.session.commit()
        return {'status': 'ok'}

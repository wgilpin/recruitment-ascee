from flask_login import current_user
from flask_app import app
from flask import request, jsonify
from recruitment import start_application, submit_application
from status import claim_applicant, release_applicant, accept_applicant, reject_applicant
from security import login_required


@app.route(
    '/api/recruits/start_application/', methods=['GET'])
@login_required
def api_start_application():
    """
    Create an application for the current user

    Returns:
        {'status': 'ok'} if application is successfully added

    Error codes:
        Forbidden (403): If logged in user has roles
        Bad request (400): If the user already has an application
    """
    return jsonify(start_application(current_user=current_user))

@app.route(
    '/api/recruits/submit_application', methods=['PUT'])
@login_required
def api_submit_application():
    """
    Submit an application for the current user

    Returns:
        {'status': 'ok'} if application is successfully added

    Error codes:
        Forbidden (403): If logged in user has roles
    """
    return jsonify(submit_application(request.get_json(), current_user=current_user))



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
    '/api/recruits/accept/<int:applicant_id>', methods=['GET'])
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

from flask_login import login_required, current_user
from flask_app import app
from flask import request, jsonify
from recruitment import add_applicant_note

@app.route(
    '/api/recruits/add_note/<int:applicant_id>', methods=['PUT'])
@login_required
def api_add_applicant_note(applicant_id):
    """
    Add a note for an applicant

    Args:
        applicant_id (int): User key of applicant
        text (in body): The note

    Returns:
        {'status': 'ok'} if note is successfully added

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
    return jsonify(add_applicant_note(applicant_id, text=request.form['text'], current_user=current_user))


@app.route(
    '/api/recruits/add_chat_log/<int:applicant_id>', methods=['PUT'])
@login_required
def api_add_applicant_chat(applicant_id):
    """
    Add a partial chat log for an applicant

    Args:
        applicant_id (int): User key of applicant
        text (in body): The chat log

    Returns:
        {'status': 'ok'} if log is successfully added

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
    return jsonify(add_applicant_note(applicant_id, text=request.form['text'], is_chat_log=True, current_user=current_user))

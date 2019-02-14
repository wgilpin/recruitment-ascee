from flask_login import login_required, current_user
from flask_app import app
from flask import request, jsonify
from recruitment import add_applicant_note


@app.route('/api/recruits/<int:applicant_id>/notes', methods=['GET'])
@login_required
def api_get_applicant_notes_and_logs(applicant_id):
    """
    Get notes and chat logs for current application of an applicant.

    Args:
        applicant_id (int)

    Returns:
        response

    Example:
        {
            "info":
            "notes": [
                {
                    "timestamp": "ISO Date string",
                    "author_id": 61097499,
                    "note_id": 101052109,
                    "text": "kiugoiugnboyiug ouiguy gkuyf jtf kuf kuyf kutf ikufk uyfku fkj iy gkuyg iuy guy kuy uky kuyg kuy iuy",
                },
            ],
            "logs": [
                {
                    "timestamp": "ISO Date string",
                    "author_id": 61097499,
                    "note_id": 101052109,
                    "title": "Chat log from friday",
                    "text": "kiugoiugnboyiug ouiguy gkuyf jtf kuf kuyf kutf ikufk uyfku fkj iy gkuyg iuy guy kuy uky kuyg kuy iuy",
                },
            ]
        }

    """
    raise NotImplementedError()


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

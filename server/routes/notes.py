from flask_login import current_user
from security import login_required
from flask_app import app
from flask import request, jsonify
from recruitment import add_applicant_note, get_applicant_notes


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
        "info": [
            {
                "timestamp": "ISO Date string",
                "author": "Tommy Tattle",
                "is_chat_log": True,
                "id": 101052109,
                "title": "Chat log from friday",
                "text": "kiugoiugnboyiug ouiguy gkuyf jtf kuf kuyf kutf ikufk uyfku fkj iy gkuyg iuy guy kuy uky kuyg kuy iuy",
            },
        ]
        }
    """
    return jsonify(get_applicant_notes(applicant_id, current_user=current_user))


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
    return jsonify(add_applicant_note(applicant_id, text=request.json.get('text'), current_user=current_user))


@app.route(
    '/api/recruits/add_chat_log/<int:applicant_id>', methods=['PUT'])
@login_required
def api_add_applicant_chat(applicant_id):
    """
    Add a partial chat log for an applicant

    Args:
        applicant_id (int): User key of applicant
        text (in body): The chat log
        title (in body): The chat log description

    Returns:
        {'status': 'ok'} if log is successfully added

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or a
            recruiter who has claimed this applicant
        Bad request (400): If the given user is not an applicant
    """
    return jsonify(add_applicant_note(
        applicant_id,
        text=request.json['text'],
        title=request.json['title'],
        is_chat_log=True,
        current_user=current_user
    ))

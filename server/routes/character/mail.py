from flask_login import login_required, current_user
from flask_app import app
from flask import jsonify
from character import get_character_mail, get_mail_body


@app.route('/api/character/<int:character_id>/mail', methods=['GET'])
@login_required
def api_character_mail(character_id):
    """
    Get mail headers for a given character.

    Returned dictionary is of the form
    {'info': [mail_1, mail_2, ...]}. Each mail is as returned by
    ESI, with the additional key `from_name`, and if
    redlisted then `redlisted` whose value is True. Recipients have the
    additional key `recipient_name`.

    A mail is redlisted if any of the participants in the mail are redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_mail(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/mail/<int:mail_id>', methods=['GET'])
@login_required
def api_mail_body(character_id, mail_id):
    """
    Get body for a given mail.

    Returned data is as returned by ESI.

    Args:
        character_id (int): A character who sent or received the mail.
        mail_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_mail_body(character_id, mail_id, current_user=current_user))

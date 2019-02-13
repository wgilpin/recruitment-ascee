from flask_login import login_required, current_user
from flask_app import app
from flask import jsonify
from character.finance import get_character_contacts


@app.route('/api/character/<int:character_id>/contacts', methods=['GET'])
@login_required
def api_character_contacts(character_id):
    """
    Get contacts for a given character.

    Returned dictionary is of the form
    {'info': [contact_1, contact_2, ...]}. Each contact is as returned by
    ESI, with the additional keys `name`, `corporation_id`, `corporation_name`,
    if in an alliance then `alliance_id` and `alliance_name`, and if
    redlisted then `redlisted` whose value is True.

    A contact is redlisted if they are redlisted directly or part of a
    redlisted corporation or alliance.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_contacts(character_id, current_user=current_user))

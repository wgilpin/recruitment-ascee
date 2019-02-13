from flask_login import login_required, current_user
from flask_app import app
from flask import jsonify
from character_data import get_character_skills


@app.route('/api/character/<int:character_id>/skills', methods=['GET'])
@login_required
def api_character_skills(character_id):
    """
    Get current and queued skills for a given character.

    Returned dictionary is of the form
    {'skills': skill_list, 'queue': queue_list}. skill_list is a list of
    skill dictionaries as returned by ESI, and queue_list is a list of
    queued skill dictionaries as returned by ESI. All skill dictionaries
    have the additional keys `skill_name` and `group_name`.

    Skills will not be redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_skills(character_id, current_user=current_user))

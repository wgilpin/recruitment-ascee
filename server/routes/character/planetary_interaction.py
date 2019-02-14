from flask_app import app
from flask_login import login_required, current_user
from flask import jsonify
from character.planetary_interaction import get_character_planetary_interaction


@app.route('/api/character/<int:character_id>/planetary_interaction', methods=['GET'])
@login_required
def api_character_planetary_interaction(character_id):
    """
    Get planetary interaction data for a given character.

    Returned dictionary is of the same form as returned by ESI, but with
    additional fields 'solar_system_name', 'region_name', and 'region_id' for
    each entry. Returns {'info': entry_list}.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_planetary_interaction(character_id, current_user=current_user))

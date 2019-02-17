from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from character import get_character_blueprints


@app.route('/api/character/<int:character_id>/blueprints', methods=['GET'])
@login_required
def api_character_bookmarks(character_id):
    """
    Get blueprints for a given character.

    Returned dictionary is as returned by ESI, but with additional keys `type_name`,
    `system_id`, and `system_name`.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_blueprints(character_id, current_user=current_user))

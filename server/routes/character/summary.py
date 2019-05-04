from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from character.summary import get_character_summary


@app.route('/api/character/summary', methods=['GET'])
@app.route('/api/character/<int:character_id>/summary', methods=['GET'])
@login_required
def api_character_summary(character_id=None):
    """
    Get basic data for a given character from ESI.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Example:

        {
            'info': {
                'corporation_id': 102830721,
                'corporation_name': 'The Best Corp',
                'alliance_id': None,  # can be int
                'alliance_name': None,  # can be str
                'security_status': 0.,
                'character_id': 123421315,
                'character_name': 'Characterus Besticus',
                'redlisted': ['corporation_name'],
            },
        }

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(
        get_character_summary(
            character_id if character_id else current_user.id,
            current_user=current_user
        ))

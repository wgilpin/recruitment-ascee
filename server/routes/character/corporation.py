from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from character.corporation import get_character_corporation_history


@app.route('/api/character/<int:character_id>/corporation_history', methods=['GET'])
@login_required
def api_character_corporation_history(character_id):
    """
    Get corporation history for a given character.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Example:

        {
            "info": [
                {
                    "is_deleted": True,
                    "record_id": 500,
                    "start_date": "2016-06-26T20:00:00Z",
                    "corporation_name": "Mijdelkt",
                    "alliance_name":  "Idggeuuyet",
                    "redlisted": ["corporation_name"]
                }
            ]
        }

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_corporation_history(character_id, current_user=current_user))

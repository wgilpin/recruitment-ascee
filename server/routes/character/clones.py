from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from character.clones import get_character_clones


@app.route('/api/character/<int:character_id>/clones', methods=['GET'])
@login_required
def api_character_summary(character_id):
    """
    Get clone data for a given character.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Example:

        {
            "info": {
                "home_location": {
                    "location_type": "structure",
                    "system_id": 102321,  # may be None
                    "system_name": "Jita",  # may be None
                    "region_id": 1000002,  # may be None
                    "region_name": "The Forge",  # may be None
                    "redlisted": [],
                },
                "jump_clones": [
                    {
                        "jump_clone_id": 321973216,
                        "location_type": "station",
                        "system_id": 102321,  # may be None
                        "system_name": "Jita",  # may be None
                        "region_id": 1000002,  # may be None
                        "region_name": "The Forge",  # may be None
                        "redlisted": [],
                    },
                ]
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_clones(character_id, current_user=current_user))

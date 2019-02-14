from flask_login import login_required, current_user
from flask_app import app
from flask import jsonify
from character.industry import get_character_industry


@app.route('/api/character/<int:character_id>/industry', methods=['GET'])
@login_required
def api_character_industry(character_id):
    """
    Gets industry jobs for a given character.

    Returns a dictonary {'info': result_list} where result_list is a list of
    results from ESI, Each result additionally has the keys 'blueprint_type_name'
    and 'station_name'.

    Example:

    {
      "info":
      [
        {
          "blueprint_type_name": "Hel",
          "blueprint_type_id": 2047,
          "cost": 118.01,
          "duration": 548,
          "end_date": "2014-07-19T15:56:14Z",
          "licensed_runs": 200,
          "output_location_id": 60006382,
          "runs": 1,
          "start_date": "2014-07-19T15:47:06Z",
          "station_id": 60006382,
          "station_name": "Jita IV-4 Calda...",
          "status": "active"
        }
      ]
    }

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_industry(character_id, current_user=current_user))

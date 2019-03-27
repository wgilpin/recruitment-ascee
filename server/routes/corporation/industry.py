from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from corporation.industry import get_corporation_industry


@app.route('/api/corporation/<int:corporation_id>/industry', methods=['GET'])
@login_required
def api_corporation_industry(corporation_id):
    """
    Gets industry jobs for a given corporation.

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
        corporation_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_corporation_industry(corporation_id, current_user=current_user))

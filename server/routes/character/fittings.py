from flask_login import login_required, current_user
from flask_app import app
from flask import jsonify


@app.route('/api/character/<int:character_id>/fittings', methods=['GET'])
@login_required
def api_character_fittings(character_id):
    """
    Gets fittings for a given character.

    Returns a dictonary {'info': result_list} where result_list is a list of
    results from ESI, Each result additionally has the key 'ship_type_name',
    and each item has the additional key 'type_name'.

    Example:

    {
      "info":
      [
        {
          "description": "Awesome Vindi fitting",
          "fitting_id": 1,
          "items": [
            {
              "flag": 12,
              "quantity": 1,
              "type_id": 1234
            }
          ],
          "name": "Best Vindicator",
          "ship_type_id": 123
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
    raise NotImplementedError()
    # return jsonify(get_character_fittings(character_id, current_user=current_user))

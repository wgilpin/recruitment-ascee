from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from character.mining import get_character_mining


@app.route('/api/character/<int:character_id>/mining', methods=['GET'])
@login_required
def api_character_mining(character_id):
    """
    Gets mining ledger for a given character.

    Returns a dictonary {'info': result_list} where result_list is a list of
    results from ESI, Each result additionally has the keys 'solar_system_name',
    'price', and 'type_name'.

    Example:

    {
      "info":
      [
        {
          "date": "2017-09-19",
          "quantity": 7004,
          "solar_system_id": 30003707,
          "solar_system_name": "Jita",
          "type_id": 17471,
          "type_name": "Mercoxit",
          "price": 1234.50,
        },
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
    return jsonify(get_character_mining(character_id, current_user=current_user))

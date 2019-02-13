from flask_login import login_required, current_user
from flask_app import app
from flask import jsonify
from character_data import get_character_assets


@app.route('/api/character/<int:character_id>/assets', methods=['GET'])
@login_required
def api_character_assets(character_id):
    """
    Gets assets for a given character.

    Assets are returned as nested dictionaries encoding location information.
    The first three levels are region, system, and station/structure. After
    that, additional levels are containers.

    Items will have attributes as returned by ESI. They will additionally have
    keys `name` and `price`.

    Locations will have the attributes `id`, `name` and, if redlisted, a key `redlisted`
    whose value is True.

    Items within regions and containers are stored in a key `items` whose
    value is a list.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Examples:
        # an attribute of an item:
        response[region_id]['items'][system_id]['items'][structure_id]['items'][item_id][attribute_name]

        # an attribute of an item in a container (e.g. Hangar)
        response[region_id]['items'][system_id]['items'][structure_id]['items'][container_id]['items'][item_id][attribute_name]

        # whether a region is redlisted:
        response[region_id]['redlisted']  # True/False

        # name of a region:
        response[region_id]['name']

        # name of a structure:
        response[region_id]['items'][system_id]['items'][structure_id]['name']

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_assets(character_id, current_user=current_user))

from flask_login import current_user
from security import login_required
from flask_app import app
from flask import request, jsonify
from search import get_search_results, get_names_to_ids, get_ids_to_names


@app.route('/api/search', methods=['GET'])
@login_required
def api_search():
    """
    Searches for things of a given category that match a partial string.
    Returns a dictionary mapping IDs to names.

    Args:
        category (str)
            A category name such as `character`, `corporation`, `system`,
            `alliance`, 'inventory_type`, or `region`.
        search (str)
            A partial search string

    Returns:
        response (dict)
            Entries are mappings from ids to names.

    Example:
        response = {
            'info': [
                '1937622137': 'Twine Endashi',
                ...
            ]
        }

    Error codes:
        Forbidden (403): If logged in user is not a recruiter or admin
        Bad request (400): If category is not a valid category
    """
    category = request.args.get('category')
    search = request.args.get('search')
    return jsonify(get_search_results(category, search, current_user=current_user))


@app.route('/api/names_to_ids', methods=['PUT'])
@login_required
def api_names_to_ids():
    """
    Gets the IDs of names of a given category.

    Args:
        category (str)
            A category name such as `character`, `corporation`, `solar_system`,
            `alliance`, 'inventory_type`, or `region`.
        names (list of str)
            Names to retrieve. Only exact matches will be returned.
    Example:
        response = {
            'info': {
                'Twine Endashi': '1937622137',
                ...
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not a recruiter or admin
        Bad request (400): If category is not a valid category
    """
    args = request.get_json()
    category = args['category']
    name_list = args['names']
    return jsonify(get_names_to_ids(category, name_list, current_user=current_user))


@app.route('/api/ids_to_names', methods=['PUT'])
@login_required
def api_ids_to_names():
    """
    Gets the IDs of names of a given category.

    Returns a dict whose keys are IDs and values are dicts with keys `name` (str)
    and `redlisted` (bool).

    Args:
        ids (list of int)
            IDs whose names we want to retrieve.
    Example:
        response = {
            'info': {
                '1937622137': {
                    'name': 'Twine Endashi',
                     'redlisted': False,
                },
                ...
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not a recruiter or admin
    """
    id_list = request.get_json().get('ids')
    return jsonify(get_ids_to_names(id_list, current_user=current_user))

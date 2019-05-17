from flask_login import current_user
from security import login_required
from flask_app import app
from flask import request, jsonify
from character.finance import get_character_journal, get_character_transactions, \
    get_character_market_contracts, get_character_market_history


@app.route('/api/character/<int:character_id>/market_contracts', methods=['GET'])
@login_required
def api_character_market_contracts(character_id):
    """
    Get contracts for a given character.

    Returned dictionary is of the form
    {'info': [contract_1, contract_2, ...]}. Each contract is as returned by

    ESI, with the additional keys `items` (containing a list of item data, as
    returned by the contracts items endpoint with the additional key `type_name`),
    `issuer_corporation_id`, `issuer_alliance_id` (possibly None),
    `issuer_corporation_name`, `issuer_corporation_ticker`,
    `issuer_alliance_name` (possibly None),
    `issuer_name`, and similar keys for `acceptor`. If
    `start_location_id` and `end_location_id` are present, will also include
    `start_location_name` and `end_location_name`.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_market_contracts(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/market', methods=['GET'])
@login_required
def api_character_market_history(character_id):
    """
    Get open and historical market orders for a given character.

    Returned dictionary is of the form
    {'info': [order_1, order_2, ...]}. Each order is as returned by
    ESI, with the additional keys `location_name`, `region_name`, `value`,
    `is_open` (bool), and `type_name`. If redlisted then will
    include `redlisted` whose value is True.
    If the order is a buy order, `price` and `value` will be negative.

    An order is redlisted if it includes items that are redlisted, or is
    at a redlisted location.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_market_history(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/journal', methods=['GET'])
@login_required
def api_character_journal(character_id):
    """
    Get wallet journal for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by ESI. If
    `first_party_id` and/or `second_party_id` are present, the entry will also
    have the key `first_party` and/or `second_party` whose value is a dict with
    keys `id`, `name`, `party_type` ('corporation' or 'character'),
    `corporation_name`, and `corporation_ticker`. Each entry also has a
    'redlisted' list of redlisted column names.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_journal(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/transactions', methods=['GET'])
@login_required
def api_character_transactions(character_id):
    """
    Get wallet transactions for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...], 'lowest_id': integer}.
    Each entry is as returned by ESI, with
    an additional 'redlisted' list of redlisted column names. Returns a
    maximum of 2500 entries.

    Args:
        character_id (int)
        highest_id (int, optional): the highest transaction ID to return.

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    highest_id = request.args.get('highest_id')
    return jsonify(get_character_transactions(character_id, highest_id=highest_id, current_user=current_user))

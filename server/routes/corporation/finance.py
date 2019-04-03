from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from corporation.finance import get_corporation_wallet, \
    get_corporation_market_contracts, get_corporation_market_history


@app.route('/api/corporation/<int:corporation_id>/market_contracts', methods=['GET'])
@login_required
def api_corporation_market_contracts(corporation_id):
    """
    Get contracts for a given corporation.

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
        corporation_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_corporation_market_contracts(corporation_id, current_user=current_user))


@app.route('/api/corporation/<int:corporation_id>/market', methods=['GET'])
@login_required
def api_corporation_market_history(corporation_id):
    """
    Get open and historical market orders for a given corporation.

    Returned dictionary is of the form
    {'info': [order_1, order_2, ...]}. Each order is as returned by
    ESI, with the additional keys `location_name`, `region_name`, `value`, and
    `type_name`. If redlisted then will include `redlisted` whose value is True.
    If the order is a buy order, `price` and `value` will be negative.

    An order is redlisted if it includes items that are redlisted, or is
    at a redlisted location.

    Args:
        corporation_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_corporation_market_history(corporation_id, current_user=current_user))


{
    'info': {
        1: {  # division number
           'division_name': 'Division 1',
            'info': [entry_1, entry_2, ...],
        },
    }
}

@app.route('/api/corporation/<int:corporation_id>/wallet', methods=['GET'])
@login_required
def api_corporation_wallet(corporation_id):
    """
    Get wallet journal for a given corporation.

    Returned dictionary is of the form

    {
        'info': {
            1: {  # division number
               'division_name': 'Division 1',
                'info': [entry_1, entry_2, ...],
            },
            ...
        }
    }

    Each entry is as returned by ESI. If
    `first_party_id` and/or `second_party_id` are present, the entry will also
    have the key `first_party` and/or `second_party` whose value is a dict with
    keys `id`, `name`, `party_type` ('corporation' or 'corporation'),
    `corporation_name`, and `corporation_ticker`. If an entry is redlisted, it
    will have the key `redlisted` with value True.

    Entries are redlisted if first_party or second_party is redlisted.

    Args:
        corporation_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_corporation_wallet(corporation_id, current_user=current_user))

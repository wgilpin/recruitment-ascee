from esi import get_op, get_paged_op, ESIError, sort_ids_by_category
from models import (
    Character, Corporation, Alliance, Type, Region, Group,
    Station, Structure, System, db
)
from models.eve import get_details_for_id
from flask import jsonify
from flask_login import login_required, current_user
from flask_app import app
from security import (
    is_applicant_character_id, has_applicant_access, character_application_access_check)
from exceptions import ForbiddenException, BadRequestException
import cachetools
from collections import namedtuple
from datetime import date, datetime
from json import dumps
import pyswagger

SECONDS_TO_CACHE = 10 * 60

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    if isinstance(obj, pyswagger.primitives._time.Datetime):
        return obj.v.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))

@app.route('/api/character/<int:character_id>/assets', methods=['GET'])
@login_required
def api_character_assets(character_id):
    """
    Gets assets for a given character.

    Assets are returned as nested dictionaries encoding location information.
    The first three levels are region, system, and station/structure. After
    that, additional levels are containers.

    Items will have attributes as returned by ESI. They will additionally have
    keys `type_name` and `price`.

    Locations will have the attributes `name` and, if redlisted, a key `redlisted`
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


@app.route('/api/character/<int:character_id>/bookmarks', methods=['GET'])
@login_required
def api_character_bookmarks(character_id):
    """
    Get bookmarks for a given character.

    Returned dictionary is of the form
    {'info': [bookmark_1, bookmark_2, ...]}. Each bookmark is as returned by
    ESI, with the additional keys `folder_name` (if `folder_id` is present),
    `system_id`, and `system_name`.

    Bookmarks in redlisted locations will also have the key `redlisted`
    whose value is True.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return dumps(get_character_bookmarks(character_id, current_user=current_user), default=json_serial)

@app.route('/api/character/<int:character_id>/calendar/<int:event_id>', methods=['GET'])
@login_required
def api_character_calendar_event(character_id, event_id):
    """
    Get calendar event details for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by
    ESI, with the additional key `redlisted` whose value is True if the entry
    is owned by a redlisted entity.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return dumps(
        get_character_calendar_event(character_id, event_id, current_user=current_user),
        default=json_serial
    )


@app.route('/api/character/<int:character_id>/calendar', methods=['GET'])
@login_required
def api_character_calendar(character_id):
    """
    Get calendar entries for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by
    ESI, with the additional key `redlisted` whose value is True if the entry
    is owned by a redlisted entity.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return dumps(get_character_calendar(character_id, current_user=current_user), default=json_serial)


@app.route('/api/character/<int:character_id>/contacts', methods=['GET'])
@login_required
def api_character_contacts(character_id):
    """
    Get contacts for a given character.

    Returned dictionary is of the form
    {'info': [contact_1, contact_2, ...]}. Each contact is as returned by
    ESI, with the additional keys `name`, `corporation_id`, `corporation_name`,
    if in an alliance then `alliance_id` and `alliance_name`, and if
    redlisted then `redlisted` whose value is True.

    A contact is redlisted if they are redlisted directly or part of a
    redlisted corporation or alliance.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_contacts(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/mail', methods=['GET'])
@login_required
def api_character_mail(character_id):
    """
    Get mail headers for a given character.

    Returned dictionary is of the form
    {'info': [mail_1, mail_2, ...]}. Each mail is as returned by
    ESI, with the additional key `from_name`, and if
    redlisted then `redlisted` whose value is True. Recipients have the
    additional key `recipient_name`.

    A mail is redlisted if any of the participants in the mail are redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_mail(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/market_contracts', methods=['GET'])
@login_required
def api_character_market_contracts(character_id):
    """
    Get contracts for a given character.

    Returned dictionary is of the form
    {'info': [contract_1, contract_2, ...]}. Each contract is as returned by
    ESI, with the additional keys `items` (containing a list of item data, as
    returned by the contracts items endpoint with the additional key `type_name`),
    `issuer_corporation_name`, `issuer_name`, and `acceptor_name`. If
    `start_location_id` and `end_location_id` are present, will also include
    `start_location_name` and `end_location_name`. If redlisted then will
    include `redlisted` whose value is True.

    A contract is redlisted if it includes participants or items that are
    redlisted, or if it starts or ends at a redlisted location.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_market_contracts(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/market_history', methods=['GET'])
@login_required
def api_character_market_history(character_id):
    """
    Get open and historical market orders for a given character.

    Returned dictionary is of the form
    {'info': [order_1, order_2, ...]}. Each order is as returned by
    ESI, with the additional keys `location_name`, `region_name`, `value`, and
    `type_name`. If redlisted then will include `redlisted` whose value is True.
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


@app.route('/api/character/<int:character_id>/skills', methods=['GET'])
@login_required
def api_character_skills(character_id):
    """
    Get current and queued skills for a given character.

    Returned dictionary is of the form
    {'skills': skill_list, 'queue': queue_list}. skill_list is a list of
    skill dictionaries as returned by ESI, and queue_list is a list of
    queued skill dictionaries as returned by ESI. All skill dictionaries
    have the additional keys `skill_name` and `group_name`.

    Skills will not be redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return dumps(get_character_skills(character_id, current_user=current_user), default=json_serial)


@app.route('/api/character/<int:character_id>/wallet', methods=['GET'])
@login_required
def api_character_wallet(character_id):
    """
    Get wallet journal for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by ESI. If
    `first_party_id` and/or `second_party_id` are present, the entry will also
    have the key `first_party` and/or `second_party` whose value is a dict with
    keys `id`, `name`, `party_type` ('corporation' or 'character'),
    `corporation_name`, and `corporation_ticker`. If an entry is redlisted, it
    will have the key `redlisted` with value True.

    Entries are redlisted if first_party or second_party is redlisted.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_wallet(character_id, current_user=current_user))


@app.route('/api/character/<int:character_id>/mail/<int:mail_id>', methods=['GET'])
@login_required
def api_mail_body(character_id, mail_id):
    """
    Get body for a given mail.

    Returned data is as returned by ESI.

    Args:
        character_id (int): A character who sent or received the mail.
        mail_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return dumps(get_mail_body(character_id, mail_id, current_user=current_user), default=json_serial)

def get_location(character, location_id):
    if 60000000 <= location_id < 64000000:  # station
        return Station.get(location_id)
    elif location_id > 50000000:  # structure
        return Structure.get(character, location_id)
    elif 30000000 < location_id < 32000000:  # system
        system = System.get(location_id)
        return namedtuple('Location', ['system_id', 'name']) (location_id, system.name)
    else:
        raise ValueError(
            'location_id {} does not correspond to station'
            ' or structure'.format(location_id)
        )


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_calendar(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    calendar_data = character.get_op(
        'get_characters_character_id_calendar',
        character_id=character_id
    )
    return {'info': calendar_data}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_calendar_event(character_id, event_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    event_data = character.get_op(
        'get_characters_character_id_calendar_event_id',
        character_id=character_id,
        event_id=event_id,
    )
    event_data['owner_name'] = get_details_for_id(event_data['owner_id'])['name']
    return {'info': event_data}


def get_transaction_party(party_id):
    try:
        character = Character.get(party_id)
        corporation = Corporation.get(character.corporation_id)
        return_dict = {
            'id': party_id,
            'name': character.name,
            'party_type': 'character',
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
        }
        return Character.is_redlisted, return_dict
    except IOError:  # change to the correct exception when you know it
        corporation = Corporation.get(party_id)
        return_dict = {
            'id': party_id,
            'name': corporation.name,
            'party_type': 'corporation',
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
        }
        return Corporation.is_redlisted, return_dict


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_wallet(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    wallet_data = character.get_paged_op(
        'get_characters_character_id_wallet_journal',
        character_id=character_id
    )
    party_ids = get_party_ids(wallet_data)
    party_data = get_party_data(party_ids)
    for wallet_entry in wallet_data:
        wallet_entry['date'] = str(wallet_entry['date'].to_json())
        redlisted = wallet_entry['amount'] == 0
        if 'first_party_id' in wallet_entry:
            wallet_entry['first_party'] = party_data[wallet_entry['first_party_id']]
        if 'second_party_id' in wallet_entry:
            wallet_entry['second_party'] = party_data[wallet_entry['second_party_id']]
        if wallet_entry.get('first_party_id', None) == character_id:
            wallet_entry['other_party'] = wallet_entry.get('second_party', {'name': ''})['name']
        else:
            wallet_entry['other_party'] = wallet_entry.get('first_party', {'name': ''})['name']
        if redlisted:
            wallet_entry['redlisted'] = True
    return {'info': wallet_data}


def get_party_ids(wallet_data):
    party_ids = set()
    for wallet_entry in wallet_data:
        if 'first_party_id' in wallet_entry:
            party_ids.add(wallet_entry['first_party_id'])
        if 'second_party_id' in wallet_entry:
            party_ids.add(wallet_entry['second_party_id'])
    return party_ids


def get_party_data(party_ids):
    sorted_ids = sort_ids_by_category(party_ids)
    party_data = {}
    corporation_list = Corporation.get_multi(sorted_ids['corporation']).values()
    for corporation in corporation_list:
        party_data[corporation.id] = {
            'id': corporation.id,
            'name': corporation.name,
            'party_type': 'corporation',
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
            'redlisted': corporation.is_redlisted
        }
    character_list = Character.get_multi(sorted_ids['character']).values()
    for character in character_list:
        party_data[character.id] = {
            'id': character.id,
            'name': character.name,
            'party_type': 'character',
            'corporation_name': character.corporation.name,
            'corporation_ticker': character.corporation.ticker,
            'redlisted': character.is_redlisted,
        }
    return party_data


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_contacts(character_id, current_user=None):
    contacts_dict = {}
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    contacts_list = character.get_paged_op(
        'get_characters_character_id_contacts',
        character_id=character_id
    )
    contacts_dict = {entry['contact_id']: entry for entry in contacts_list}
    for contact_id, entry in contacts_dict.items():
        details = get_details_for_id(contact_id)
        entry['name'] = details['name']
        if 'corporation_id' in details:
            entry['corporation_id'] = details['corporation_id']
        if 'corporation_name' in details:
            entry['corporation_name'] = details['corporation_name']
        if 'alliance_id' in details:
            entry['alliance_id'] = details['alliance_id']
        if 'alliance_name' in details:
            entry['alliance_name'] = details['alliance_name']
        if 'redlisted' in entry:
            entry['redlisted'] = details['redlisted']

    return {'info': contacts_dict }


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_mining(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    mining_data = character.get_op(
        'get_characters_character_id_mining',
        character_id=character_id,
    )
    return_list = []
    for entry in mining_data:
        type = Type.get(entry['type_id'])
        system = System.get(entry['solar_system_id'])
        return_list.append({
            'date': entry['date'],
            'quantity': entry['quantity'],
            'system_id': entry['solar_system_id'],
            'system_name': system.name,
            'type_id': entry['type_id'],
            'type_name': type.name,
            'value': entry['quantity'] * type.price,
        })
        if system.is_redlisted:
            return_list[-1]['is_redlisted'] = True
    return {'info': return_list}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_market_contracts(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    contract_list = character.get_paged_op(
        'get_characters_character_id_contracts',
        character_id=character_id
    )
    # issuer_corporation, acceptor, issuer, end_location, start_location
    for entry in contract_list:
        entry['items'] = character.get_op(
            'get_characters_character_id_contracts_contract_id_items',
            character_id=character_id,
            contract_id=entry['contract_id'],
        )
        entry['issuer_corporation_name'] = Corporation.get(entry['issuer_corporation_id']).name
        issuer = Character.get(entry['issuer_id'])
        acceptor = Character.get(entry['acceptor_id'])
        entry['issuer_name'] = issuer.name
        entry['acceptor_name'] = acceptor.name
        if 'start_location_id' in entry:
            start_location = get_location(character, entry['start_location_id'])
            if start_location is None:
                entry['start_location_name'] = 'Unknown Structure {}'.format(entry['start_location_id'])
            else:
                entry['start_location_name'] = start_location.name
                if start_location.is_redlisted:
                    entry['redlisted'] = True
        if 'end_location_id' in entry:
            end_location = get_location(character, entry['end_location_id'])
            if end_location is None:
                entry['end_location_name'] = 'Unknown Structure {}'.format(entry['start_location_id'])
            else:
                entry['end_location_name'] = end_location.name
                if end_location.is_redlisted:
                    entry['redlisted'] = True
        if entry.get('redlisted', False):
            pass
        elif issuer.is_redlisted or acceptor.is_redlisted:
            entry['redlisted'] = True
        elif any(Type.get(item['type_id']).is_redlisted for item in entry['items']):
            entry['redlisted'] = True

    return {'info': contract_list}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_assets(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    asset_list = character.get_paged_op(
        'get_characters_character_id_assets',
        character_id=character_id,
    )
    type_set = set()
    for entry in asset_list:
        type_set.add(entry['type_id'])
    type_dict = Type.get_multi(list(type_set))
    for entry in asset_list:
        type = type_dict[entry['type_id']]
        entry['name'] = type.name
        entry['price'] = entry['quantity'] * type.price
        if type.is_redlisted:
            entry['redlisted'] = True
    return organize_assets_by_location(character, asset_list)


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_bookmarks(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    bookmarks_list = character.get_paged_op(
        'get_characters_character_id_bookmarks',
        character_id=character_id,
    )
    folder_list = character.get_paged_op(
                'get_characters_character_id_bookmarks_folders',
                character_id=character_id)
    folders = { folder['folder_id']: folder['name'] for folder in folder_list }
    bookmarks_dict = {entry['bookmark_id']: entry for entry in bookmarks_list}
    for bookmark_id, entry in bookmarks_dict.items():
        if 'folder_id' in entry.keys():
            if entry['folder_id'] in folders:
                esi_folder_name = folders[entry['folder_id']]
                if esi_folder_name == 'Null':
                    esi_folder_name = 'Personal Locations'
                entry['folder_name'] = esi_folder_name
            else:
                entry['folder_name'] = 'Personal Locations'
        location = get_location(character, entry['location_id'])
        entry['system_id'] = location.system_id
        entry['system_name'] = location.name
        entry['id'] = bookmark_id
        del entry['bookmark_id']
        system = System.get(location.system_id)
        if system.is_redlisted:
            entry['redlisted'] = True
    return {'info': bookmarks_dict}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_mail(character_id, current_user=None):
    target_character = Character.get(character_id)
    character_application_access_check(current_user, target_character)
    mail_list = target_character.get_op(
        'get_characters_character_id_mail',
        character_id=character_id,
    )

    from_ids = set(entry['from'] for entry in mail_list)
    character_ids = set()
    corp_ids = set()
    alliance_ids = set()
    id_set_dict = {
        'character': character_ids,
        'corporation': corp_ids,
        'alliance': alliance_ids
    }
    name_data = get_op(
        'post_universe_names', ids=list(from_ids)
    )
    for entry in name_data:
        id_set_dict[entry['category']].add(entry['id'])
    for entry in mail_list:
        for recipient in entry['recipients']:
            id_set_dict[recipient['recipient_type']].add(recipient['recipient_id'])
    characters = Character.get_multi(character_ids)
    corporations = Corporation.get_multi(corp_ids)
    alliances = Alliance.get_multi(alliance_ids)
    all_parties = {}
    all_parties.update(characters)
    all_parties.update(corporations)
    all_parties.update(alliances)

    for entry in mail_list:
        entry['from_name'] = all_parties[entry['from']].name
        for recipient in entry['recipients']:
            recipient['recipient_name'] = all_parties[recipient['recipient_id']].name
        recipient_ids = [r['recipient_id'] for r in entry['recipients']]
        if any(all_parties[party_id].is_redlisted for party_id in [entry['from']] + recipient_ids):
            entry['redlisted'] = True
        entry['timestamp'] = str(entry['timestamp'].to_json())
    return {'info': mail_list}


@cachetools.cached(cachetools.LRUCache(maxsize=500))
def get_mail_body(character_id, mail_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    mail_data = character.get_op(
        'get_characters_character_id_mail_mail_id',
        character_id=character_id,
        mail_id=mail_id,
    )
    return mail_data.body


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_market_history(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    order_list = character.get_op(
        'get_characters_character_id_orders',
        character_id=character_id,
    )
    order_list.extend(character.get_paged_op(
        'get_characters_character_id_orders_history',
        character_id=character_id,
    ))
    for order in order_list:
        if 'is_buy_order' not in order:  # always present if True
            order['is_buy_order'] = False
        if order['is_buy_order']:
            order['price'] *= -1
        order['value'] = order['price'] * order['volume_total']
        location = get_location(character, order['location_id'])
        if location is None:
            order['location_name'] = 'Unknown Structure {}'.format(order['location_id'])
            order['region_name'] = 'Unknown Region'
        else:
            system = System.get(location.system_id)
            region = Region.get(system.region_id)
            order['location_name'] = location.name
            order['region_name'] = region.name
        type = Type.get(order['type_id'])
        order['type_name'] = type.name
        if (location and location.is_redlisted) or type.is_redlisted:
            order['redlisted'] = True
    return {'info': order_list}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_skills(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    skill_data = character.get_op(
        'get_characters_character_id_skills',
        character_id=character_id,
    )
    queue_data = character.get_op(
        'get_characters_character_id_skillqueue',
        character_id=character_id,
    )
    for skill_list in skill_data['skills'], queue_data:
        for entry in skill_list:
            skill = Type.get(entry['skill_id'])
            group = Group.get(skill.group_id)
            entry['skill_id'] = {
                'group_name': group.name,
                'skill_name': skill.name,
            }
    return {'info': {'skills': skill_data['skills'], 'queue': queue_data}}


class DummySystem(object):
    id = -1
    name = 'Unknown System'
    region_id = None
    is_redlisted = False


class DummyRegion(object):
    id = -1
    name = 'Unknown Region'
    is_redlisted = False


def organize_assets_by_location(character, asset_list):
    asset_dict = {
        entry['item_id']: entry for entry in asset_list
    }
    location_set = set(entry['location_id'] for entry in asset_list)
    location_dict = {id: {'items': {}} for id in location_set}
    for entry in asset_list:
        location_dict[entry['location_id']]['items'][entry['item_id']] = entry
    for item_id, entry in asset_dict.items():
        if item_id in location_dict:
            entry['items'] = location_dict[item_id]['items']


    systems_dict = {}
    for location_id in location_dict:
        location = get_location(character, location_id)
        location_dict[location_id]['name'] = location.name
        if location.system_id is not None:
            system = System.get(location.system_id)
            location_dict[location_id]['redlisted'] = location.is_redlisted
        else:
            system = DummySystem
            # Use the raw redlisted value of location, since it can't
            # check if its system is redlisted
            location_dict[location_id]['redlisted'] = location.redlisted
        systems_dict[system.id] = systems_dict.get(system.id, (system, []))
        systems_dict[system.id][1].append(location_id)

    return_dict = {}
    for system, location_list in systems_dict.values():
        if system.region_id is not None:
            region = Region.get(system.region_id)
        else:
            region = DummyRegion
        if region.id not in return_dict:
            return_dict[region.id] = {
                'redlisted': region.is_redlisted,
                'name': region.name,
                'items': {},
                'id': region.id,
            }
        return_dict[region.id]['items'][system.id] = {
            'redlisted': system.is_redlisted,
            'name': system.name,
            'id': system.id,
            'items': {id: location_dict[id] for id in systems_dict[system.id][1]},
        }
    return return_dict

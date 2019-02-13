from esi import get_op, get_paged_op, ESIError
from models import (
    Character, Corporation, Alliance, Type, Region, Group,
    Station, Structure, System, db, get_id_data
)
from flask import jsonify
from flask_login import login_required, current_user
from flask_app import app
from security import (
    is_applicant_character_id, has_applicant_access, character_application_access_check)
from exceptions import ForbiddenException, BadRequestException
import cachetools
from collections import namedtuple
import pyswagger

SECONDS_TO_CACHE = 10 * 60


def get_location(character, location_id):
    return get_location_multi(character, [location_id])[location_id]


def get_location_multi(character, location_id_list):
    station_id_list = []
    structure_id_list = []
    system_id_list = []
    for location_id in location_id_list:
        if 60000000 <= location_id < 64000000:  # station
            station_id_list.append(location_id)
        elif 30000000 < location_id < 32000000:  # system
            system_id_list.append(location_id)
        elif location_id > 50000000:  # structure
            structure_id_list.append(location_id)
        else:
            raise ValueError(
                'location_id {} does not correspond to station'
                ', system, or structure'.format(location_id)
            )
    location_dict = {}
    location_dict.update(Station.get_multi(station_id_list))
    location_dict.update(System.get_multi(system_id_list))
    location_dict.update(Structure.get_multi(character, structure_id_list))
    return location_dict


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
    data_dict = get_id_data(party_ids)
    party_data = {}
    for corporation in data_dict['corporation'].values():
        party_data[corporation.id] = {
            'id': corporation.id,
            'name': corporation.name,
            'party_type': 'corporation',
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
            'redlisted': corporation.is_redlisted
        }
    for character in data_dict['character'].values():
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
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    contacts_list = character.get_paged_op(
        'get_characters_character_id_contacts',
        character_id=character_id
    )
    contacts_dict = {entry['contact_id']: entry for entry in contacts_list}
    sorted_contact_model_dict = get_id_data(contacts_dict.keys())
    for character_id, character in sorted_contact_model_dict.get('character', {}).items():
        contacts_dict[character_id]['name'] = character.name
        contacts_dict[character_id]['corporation_id'] = character.corporation_id
        contacts_dict[character_id]['corporation_name'] = character.corporation.name
        if character.corporation.alliance is not None:
            contacts_dict[character_id]['alliance_id'] = character.corporation.alliance_id
            contacts_dict[character_id]['alliance_name'] = character.corporation.alliance.name
    for corporation_id, corporation in sorted_contact_model_dict.get('corporation', {}).items():
        contacts_dict[corporation_id]['name'] = corporation.name
        contacts_dict[corporation_id]['corporation_id'] = corporation_id
        contacts_dict[corporation_id]['corporation_name'] = corporation.name
        if corporation.alliance is not None:
            contacts_dict[corporation_id]['alliance_id'] = corporation.alliance_id
            contacts_dict[corporation_id]['alliance_name'] = corporation.alliance.name
    for alliance_id, alliance in sorted_contact_model_dict.get('alliance', {}).items():
        contacts_dict[alliance_id]['name'] = alliance.name
        contacts_dict[alliance_id]['alliance_id'] = alliance_id
        contacts_dict[alliance_id]['alliance_name'] = alliance.name

    return {'info': contacts_dict}


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

    entry_items = character.get_op(
        'get_characters_character_id_contracts_contract_id_items',
        character_id=character_id,
        contract_id=[entry['contract_id'] for entry in contract_list],
    )

    location_ids = set()
    character_ids = set()
    corporation_ids = set()
    for entry in contract_list:
        entry['items'] = entry_items[entry['contract_id']]
        if 'start_location_id' in entry:
            location_ids.add(entry['start_location_id'])
        if 'end_location_id' in entry:
            location_ids.add(entry['end_location_id'])
        character_ids.add(entry['issuer_id'])
        character_ids.add(entry['acceptor_id'])
        corporation_ids.add(entry['issuer_corporation_id'])
    location_dict = get_location_multi(character, list(location_ids))
    character_dict = Character.get_multi(list(character_ids))
    corporation_dict = Corporation.get_multi(list(corporation_ids))

    # issuer_corporation, acceptor, issuer, end_location, start_location
    for entry in contract_list:
        entry['issuer_corporation_name'] = corporation_dict[entry['issuer_corporation_id']].name
        issuer = character_dict[entry['issuer_id']]
        acceptor = character_dict[entry['acceptor_id']]
        entry['issuer_name'] = issuer.name
        entry['acceptor_name'] = acceptor.name
        if 'start_location_id' in entry:
            start_location = location_dict[entry['start_location_id']]
            entry['start_location_name'] = start_location.name
        if 'end_location_id' in entry:
            end_location = location_dict[entry['end_location_id']]
            entry['end_location_name'] = end_location.name

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
        if isinstance(location, System):
            entry['system_id'] = location.id
            entry['system_name'] = location.name
            if location.is_redlisted:
                entry['redlisted'] = True
        else:
            entry['system_id'] = location.system_id
            entry['system_name'] = location.system.name
            if entry.system.is_redlisted:
                entry['redlisted'] = True
        entry['id'] = bookmark_id
        del entry['bookmark_id']
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
    location_ids = set()
    type_ids = set()
    for order in order_list:
        location_ids.add(order['location_id'])
        type_ids.add(order['type_id'])
    location_dict = get_location_multi(character, list(location_ids))
    type_dict = Type.get_multi(list(type_ids))
    for order in order_list:
        if 'is_buy_order' not in order:  # always present if True
            order['is_buy_order'] = False
        if order['is_buy_order']:
            order['price'] *= -1
        order['value'] = order['price'] * order['volume_total']
        location = location_dict[order['location_id']]
        if location is None:
            order['location_name'] = 'Unknown Structure {}'.format(order['location_id'])
            order['region_name'] = 'Unknown Region'
        elif location.system is None:
            order['location_name'] = location.name
            order['region_name'] = 'Unknown Region'
        else:
            order['location_name'] = location.name
            order['region_name'] = location.system.region.name
        type = type_dict[order['type_id']]
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
    id = -2
    name = 'Unknown System'
    region_id = None
    is_redlisted = False


class DummyRegion(object):
    id = -1
    name = 'Unknown Region'
    is_redlisted = False


def organize_assets_by_location(character, asset_list):
    asset_ids = set(entry['item_id'] for entry in asset_list)
    asset_dict = {
        entry['item_id']: entry for entry in asset_list
    }
    location_set = set(entry['location_id'] for entry in asset_list)
    location_data_dict = {id: {'items': {}} for id in location_set}
    for entry in asset_list:
        location_data_dict[entry['location_id']]['items'][entry['item_id']] = entry
    for item_id, entry in asset_dict.items():
        if item_id in location_data_dict:
            entry['items'] = location_data_dict[item_id]['items']

    location_id_list = list(set(location_data_dict.keys()).difference(asset_ids))
    location_model_dict = get_location_multi(character, location_id_list)

    systems_dict = {}
    for location_id in location_model_dict:
        location = location_model_dict[location_id]
        location_data_dict[location_id]['name'] = location.name
        if location.system_id is not None:
            system = System.get(location.system_id)
            location_data_dict[location_id]['redlisted'] = location.is_redlisted
        else:
            system = DummySystem
            # Use the raw redlisted value of location, since it can't
            # check if its system is redlisted
            location_data_dict[location_id]['redlisted'] = location.redlisted
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
            'items': {id: location_data_dict[id] for id in systems_dict[system.id][1]},
        }
    return return_dict

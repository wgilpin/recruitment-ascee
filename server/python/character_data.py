from esi import get_op, get_paged_op
from universe import (
    get_corporation_name,
    get_alliance_name, get_type_name, get_type_price, get_region_name,
    get_skill_name, get_skill_group_name, get_station_system, get_station_name,
    get_structure_system, get_structure_name
)
import cachetools

# leaving apiCharacter.js, apiLinks.js for now

SECONDS_TO_CACHE = 10 * 60


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_calendar(character_id):
    calendar_data = get_op(
        'get_characters_character_id_calendar',
        auth_id=character_id, character_id=character_id
    )
    return {'info': calendar_data}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_wallet(character_id):
    wallet_data = get_paged_op(
        'get_characters_character_id_wallet_journal',
        auth_id=character_id, character_id=character_id
    )
    for wallet_entry in wallet_data:
        wallet_entry['first_party_id']['name'] = get_character_name(
            wallet_entry['first_party_id']['id']
        )
        wallet_entry['second_party_id']['name'] = get_character_name(
            wallet_entry['second_party_id']['id']
        )
    return {'info': wallet_data}


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_character_name(character_id):
    return get_op('get_characters_character_id', character_id=character_id)['name']


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_contacts(character_id):
    contacts_list = get_paged_op(
        'get_characters_character_id_contacts',
        auth_id=character_id,
        character_id=character_id
    )
    contacts_dict = {entry['contact_id']: entry for entry in contacts_list}
    for contact_id, entry in contacts_dict.items():
        entry['name'] = get_character_name(contact_id)
        more_contact_data = get_op(
            'get_characters_character_id',
            character_id=contact_id
        )
        entry['corporation_id'] = more_contact_data['corporation_id']
        entry['corporation_name'] = get_corporation_name(entry['corporation_id'])
        if 'alliance_id' in more_contact_data:
            entry['alliance_id'] = more_contact_data['alliance_id']
            entry['alliance_name'] = get_alliance_name(entry['alliance_id'])
    return contacts_dict


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_market_contracts(character_id):
    contract_list = get_paged_op(
        'get_characters_character_id_contracts',
        auth_id=character_id,
        character_id=character_id
    )
    # issuer_corporation, acceptor, issuer, end_location, start_location
    for contract_entry in contract_list:
        contract_entry['issuer_corporation'] = get_corporation_name(contract_entry['corporation_id'])
        contract_entry['acceptor'] = get_character_name(contract_entry['acceptor_id'])
        contract_entry['issuer'] = get_character_name(contract_entry['issuer_id'])
        if 'start_location_id' in contract_entry:
            contract_entry['start_location'] = get_location_name(contract_entry['start_location_id'])
        if 'end_location_id' in contract_entry:
            contract_entry['end_location'] = get_location_name(contract_entry['end_location_id'])
    return {'info': contract_list}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_assets(character_id):
    asset_list = get_paged_op(
        'get_characters_character_id_assets',
        auth_id=character_id,
        character_id=character_id,
    )
    for entry in asset_list:
        entry['type_name'] = get_type_name(entry['type_id'])
        entry['price'] = get_type_price(entry['type_id']) * entry['quantity']
    return organize_assets_by_location(asset_list)


def organize_assets_by_location(asset_list):
    asset_dict = {
        entry['item_id']: entry for entry in asset_list
    }
    location_set = set(entry['location_id'] for entry in asset_list)
    location_dict = {id: [] for id in location_set}
    for entry in asset_list:
        location_dict[entry['location_id']].append(entry)
    for item_id, entry in asset_dict.items():
        if item_id in location_dict:
            entry['items'] = location_dict[item_id]

    system_names = {}
    location_names = {}
    id_dict = {}
    for location_id in location_dict:
        if 60000000 <= location_id < 64000000:  # station
            system_id, system_name = get_station_system(location_id)
            location_names[location_id] = get_station_name(location_id)
            system_names[system_id] = system_name
            id_dict[system_id] = id_dict.get(system_id, {})
            id_dict[system_id][location_id] = location_dict[location_id]
        elif location_id > 50000000:  # structure
            system_id, system_name = get_structure_system(location_id)
            location_names[location_id] = get_structure_name(location_id)
            system_names[system_id] = system_name
            id_dict[system_id] = id_dict.get(system_id, {})
            id_dict[system_id][location_id] = location_dict[location_id]
    return_dict = {
        system_names[system_id]: {
            location_names[location_id]: id_dict[system_id][location_id]
            for location_id in id_dict[system_id].keys()
        } for system_id in id_dict.keys()
    }

    return return_dict


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_bookmarks(character_id):
    bookmarks_list = get_paged_op(
        'get_characters_character_id_bookmarks',
        auth_id=character_id,
        character_id=character_id,
    )
    bookmarks_dict = {entry['bookmark_id']: entry for entry in bookmarks_list}
    for bookmark_id, entry in bookmarks_dict.items():
        if 'folder_id' in entry.keys():
            entry['folder_name'] = get_op(
                'get_characters_character_id_bookmarks_folder',
                auth_id=character_id,
                character_id=character_id,
                folder_id=entry['folder_id']
            )['name']
            entry['system_id'], entry['system_name'] = get_location_system(entry['location_id'])
    return {'info': bookmarks_dict}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_mail(character_id):
    mail_list = get_paged_op(
        'get_characters_character_id_mail',
        auth_id=character_id,
        character_id=character_id,
    )
    mail_dict = {entry['mail_id']: entry for entry in mail_list}
    for mail_id, entry in mail_dict:
        from_id = entry['from']
        entry['from'] = {
            'id': from_id,
            'name': get_character_name(from_id)
        }
        entry['recipients'] = [
            get_character_name(item['recipient_id'] for item in entry['recipients'])
        ]
    return mail_dict


@cachetools.cached(cachetools.LRUCache(maxsize=500))
def get_mail_body(character_id, mail_id):
    mail_data = get_op(
        'get_characters_character_id_mail_mail_id',
        auth_id=character_id,
        character_id=character_id,
        mail_id=mail_id,
    )
    return mail_data


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_market_history(character_id):
    order_list = get_paged_op(
        'get_characters_character_id_orders',
        auth_id=character_id,
        character_id=character_id,
    )
    order_list.extend(get_paged_op(
        'get_characters_character_id_orders_history',
        auth_id=character_id,
        character_id=character_id,
    ))
    for order in order_list:
        if order['is_buy_order']:
            order['price'] *= -1
        order['location_name'] = get_location_name(order['location_id'])
        order['region_name'] = get_region_name(order['region_id'])
        order['type_name'] = get_type_name(order['type_id'])
    return order_list


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_skills(character_id):
    skill_data = get_op(
        'get_characters_character_id_skills',
        auth_id=character_id,
        character_id=character_id,
    )
    queue_data = get_op(
        'get_characters_character_id_skillqueue',
        auth_id=character_id,
        character_id=character_id,
    )
    for skill_list in skill_data, queue_data:
        for entry in skill_list:
            skill_id = entry['skill_id']
            entry['skill_id'] = {
                'group_name': get_skill_group_name(skill_id),
                'skill_name': get_skill_name(skill_id),
            }
    return {'info': {'skills': skill_data, 'queue': queue_data}}

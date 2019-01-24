from esi import get_op, get_paged_op
from universe import (
    get_corporation_name,
    get_alliance_name, get_type_name, get_type_price, get_region_name,
    get_skill_name, get_skill_group_name, get_station_system, get_station_name,
    get_structure_system, get_structure_name, get_location_name, get_system_name,
    get_location_system, organize_assets_by_location, get_location
)
from redlist import (
    system_is_redlisted, type_is_redlisted, character_is_redlisted,
    corporation_is_redlisted
)
from database import get_character, get_corporation
import cachetools

# leaving apiCharacter.js, apiLinks.js for now
from server.python.database import get_character

SECONDS_TO_CACHE = 10 * 60


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_calendar(character_id):
    calendar_data = get_op(
        'get_characters_character_id_calendar',
        auth_id=character_id, character_id=character_id
    )
    return {'info': calendar_data}


def get_transaction_party(party_id):
    try:
        character = get_character(party_id)
        corporation = get_corporation(character.corporation_id)
        redlisted = character_is_redlisted(party_id)
        return_dict = {
            'id': party_id,
            'name': character.name,
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
        }
        return redlisted, return_dict
    except IOError:  # change to the correct exception when you know it
        corporation = get_corporation(party_id)
        redlisted = corporation_is_redlisted(party_id)
        return_dict = {
            'id': party_id,
            'name': corporation.name,
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
        }
        return redlisted, return_dict


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_wallet(character_id):
    wallet_data = get_paged_op(
        'get_characters_character_id_wallet_journal',
        auth_id=character_id, character_id=character_id
    )
    for wallet_entry in wallet_data:
        redlisted = wallet_entry['amount'] == 0
        if 'first_party_id' in wallet_entry:
            result = get_transaction_party(wallet_entry['first_party_id'])
            redlisted |= result[0]
            wallet_entry['first_party'] = result[1]
        if 'second_party_id' in wallet_entry:
            result = get_transaction_party(wallet_entry['second_party_id'])
            redlisted |= result[0],
            wallet_entry['second_party'] = result[1]
        if redlisted:
            wallet_entry['redlisted'] = True
    return {'info': wallet_data}


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_character_name(character_id):
    return get_character(character_id).name


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
        if character_is_redlisted(contact_id):
            entry['redlisted'] = True
    return contacts_dict


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_mining(character_id):
    mining_data = get_op(
        'get_characters_character_id_mining',
        auth_id=character_id,
        character_id=character_id,
    )
    return_list = []
    for entry in mining_data:
        return_list.append({
            'date': entry['date'],
            'quantity': entry['quantity'],
            'system_id': entry['solar_system_id'],
            'system_name': get_system_name(entry['solar_system_id']),
            'type_id': entry['type_id'],
            'type_name': get_type_name(entry['type_id']),
            'value': entry['quantity'] * get_type_price(entry['type_id']),
            'redlisted': system_is_redlisted(entry['solar_system_id']),
        })
    return {'info': return_list}


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_market_contracts(character_id):
    contract_list = get_paged_op(
        'get_characters_character_id_contracts',
        auth_id=character_id,
        character_id=character_id
    )
    # issuer_corporation, acceptor, issuer, end_location, start_location
    for entry in contract_list:
        entry['items'] = get_op(
            'get_characters_character_id_contracts_contract_id_items',
            auth_id=character_id,
            character_id=character_id,
            contract_id=entry['contract_id'],
        )
        entry['issuer_corporation'] = get_corporation_name(entry['corporation_id'])
        entry['acceptor_name'] = get_character_name(entry['acceptor_id'])
        entry['issuer_name'] = get_character_name(entry['issuer_id'])
        if 'start_location_id' in entry:
            entry['start_location'] = get_location_name(entry['start_location_id'])
        if 'end_location_id' in entry:
            entry['end_location'] = get_location_name(entry['end_location_id'])
        if (character_is_redlisted(entry['issuer_id']) or
            character_is_redlisted(entry['acceptor_id'])):
            entry['redlisted'] = True
        elif any(type_is_redlisted(item['type_id']) for item in entry['items']):
            entry['redlisted'] = True
        elif (('start_location_id' in entry) and
              system_is_redlisted(get_location_system(entry['start_location_id']))):
            entry['redlisted'] = True
        elif (('end_location_id' in entry) and
              system_is_redlisted(get_location_system(entry['end_location_id']))):
            entry['redlisted'] = True

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
        if type_is_redlisted(entry['type_id']):
            entry['redlisted'] = True
    return organize_assets_by_location(asset_list)


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
            entry['redlisted'] = system_is_redlisted(entry['system_name'])
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
        recipient_ids = list(item['recipient_id'] for item in entry['recipients'])
        entry['recipient_names'] = [
            get_character_name(item) for item in recipient_ids
        ]
        if any(character_is_redlisted[item] for item in [from_id] + recipient_ids):
            entry['redlisted'] = True
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

from esi import get_op, get_paged_op
from database import (
    Character, Corporation, Alliance, Type, TypePrice, Region, Group,
    Station, Structure, get_location, System
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


def get_transaction_party(party_id):
    try:
        character = Character.get(party_id)
        corporation = Corporation.get(character.corporation_id)
        return_dict = {
            'id': party_id,
            'name': character.name,
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
        }
        return Character.is_redlisted, return_dict
    except IOError:  # change to the correct exception when you know it
        corporation = Corporation.get(party_id)
        return_dict = {
            'id': party_id,
            'name': corporation.name,
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
        }
        return Corporation.is_redlisted, return_dict


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


@cachetools.cached(cachetools.TTLCache(maxsize=1000, ttl=SECONDS_TO_CACHE))
def get_character_contacts(character_id):
    contacts_list = get_paged_op(
        'get_characters_character_id_contacts',
        auth_id=character_id,
        character_id=character_id
    )
    contacts_dict = {entry['contact_id']: entry for entry in contacts_list}
    for contact_id, entry in contacts_dict.items():
        contact = Character.get(contact_id)
        entry['name'] = contact.name
        entry['corporation_id'] = contact.corporation_id
        corporation = Corporation.get(contact.corporation_id)
        entry['corporation_name'] = corporation.name
        if hasattr(corporation, 'alliance_id'):
            assert corporation.alliance_id is not None  # if this fails, I have to change the line directly above
            entry['alliance_id'] = corporation.alliance_id
            entry['alliance_name'] = Alliance.get(corporation.alliance_id).name
        if contact.is_redlisted:
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
        entry['issuer_corporation'] = Corporation.get(entry['corporation_id']).name
        issuer = Character.get(entry['issuer_id'])
        acceptor = Character.get(entry['acceptor_id'])
        entry['issuer_name'] = issuer.name
        entry['acceptor_name'] = acceptor.name
        if 'start_location_id' in entry:
            start_location = get_location(entry['start_location_id'])
            entry['start_location_name'] = start_location.name
            if start_location.is_redlisted:
                entry['redlisted'] = True
        if 'end_location_id' in entry:
            end_location = get_location(entry['end_location_id'])
            entry['end_location_name'] = end_location.name
            if end_location.is_redlisted:
                entry['redlisted'] = True
        if entry['redlisted']:
            pass
        elif issuer.is_redlisted or acceptor.is_redlisted:
            entry['redlisted'] = True
        elif any(Type.get(item['type_id']).is_redlisted for item in entry['items']):
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
        type = Type.get(entry['type_id'])
        entry['type_name'] = type.name
        entry['price'] = entry['quantity'] * type.price
        if type.is_redlisted:
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
        location = get_location(entry['location_id'])
        system = System.get(location.system_id)
        entry['system_id'] = location.system_id
        entry['system_name'] = system.name
        if system.is_redlisted:
            entry['redlisted'] = True
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
            'name': Character.get(from_id).name
        }
        recipient_ids = list(item['recipient_id'] for item in entry['recipients'])
        entry['recipient_names'] = [
            Character.get(item).name for item in recipient_ids
        ]
        if any(Character.get(item).is_redlisted for item in [from_id] + recipient_ids):
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
        location = get_location(order['location_id'])
        system = System.get(location.system_id)
        region = Region.get(system.region_id)
        type = Type.get(order['type_id'])
        order['location_name'] = location.name
        order['region_name'] = region.name
        order['type_name'] = type.name
        if location.is_redlisted or type.is_redlisted:
            order['redlisted'] = True
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
            skill = Type.get(entry['skill_id'])
            group = Group.get(skill.group_id)
            entry['skill_id'] = {
                'group_name': group.name,
                'skill_name': skill.name,
            }
    return {'info': {'skills': skill_data, 'queue': queue_data}}


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

    systems_dict = {}
    for location_id in location_dict:
        try:
            location = get_location(location_id)
            system = System.get(location.system_id)
            systems_dict[system.id] = systems_dict.get(system.id, (system, []))
            systems_dict[system.id][1].append(location_id)
        except IOError:  # replace with exception raised if location_id is not a station/structure
            # can only (easliy) figure this out by getting the exception
            pass

    return_dict = {}
    for system, location_list in systems_dict.items():
        region = Region.get(system.region_id)
        if region.id not in return_dict:
            return_dict[region.id] = {
                'redlisted': region.redlisted,
                'name': region.name,
                'items': {}
            }
        if system.id not in return_dict[region.id]['items']:
            return_dict[region.id]['items'][system.id] = {
                'redlisted': system.is_redlisted,
                'name': system.name,
                'items': location_dict[system.id]
            }

    return return_dict

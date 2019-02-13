from character import get_location_multi
from models import Character, Corporation, get_id_data, Type
from security import character_application_access_check


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
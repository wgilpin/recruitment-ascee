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


def get_character_transactions(character_id, highest_id=None, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    if highest_id is not None:
        kwargs = {'highest_id': highest_id}
    else:
        kwargs = {}
    wallet_data = character.get_op(
        'get_characters_character_id_wallet_transactions',
        character_id=character_id,
        **kwargs
    )
    return process_transactions(character, wallet_data)


def process_transactions(character, transaction_data):
    client_ids = list(set(entry['client_id'] for entry in transaction_data))
    type_ids = list(set(entry['type_id'] for entry in transaction_data))
    location_ids = list(set(entry['location_id'] for entry in transaction_data))
    clients = get_id_data(client_ids, sorted=False)
    types = Type.get_multi(type_ids)
    location_dict = get_location_multi(character, list(location_ids))
    for entry in transaction_data:
        entry['redlisted'] = []
        client = clients[entry['client_id']]
        type_id = entry['type_id']
        location = location_dict[entry['location_id']]
        entry['client_name'] = client.name
        if client.is_redlisted:
            entry['redlisted'].append('client_name')
        entry['type_name'] = types[type_id].name
        if types[type_id].is_redlisted:
            entry['redlisted'].append('type_name')
        entry['location_name'] = location.name
        if location.is_redlisted:
            entry['redlisted'].append('location_name')
        entry['total_value'] = entry['quantity'] * entry['unit_price']
        if abs(entry['total_value']) > 1e9:
            entry['redlisted'].append('total_value')
    if len(transaction_data) > 0:
        lowest_id = min(entry['transaction_id'] for entry in transaction_data)
    else:
        lowest_id = None
    return {'info': transaction_data, 'lowest_id': lowest_id}


def get_character_journal(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    wallet_data = character.get_paged_op(
        'get_characters_character_id_wallet_journal',
        character_id=character_id
    )
    return process_journal(character_id, wallet_data)


def process_journal(character_id, wallet_data):
    party_ids = get_party_ids(wallet_data)
    party_data = get_party_data(party_ids)
    for wallet_entry in wallet_data:
        wallet_entry['redlisted'] = []
        if wallet_entry['amount'] == 0:
            wallet_entry['redlisted'].append('amount')
        if 'first_party_id' in wallet_entry:
            wallet_entry['first_party'] = party_data.get(wallet_entry['first_party_id'])
        if 'second_party_id' in wallet_entry:
            wallet_entry['second_party'] = party_data.get(wallet_entry['second_party_id'])
        which_other_party = 'first_party'
        if wallet_entry.get('first_party_id', None) == character_id:
            which_other_party = 'second_party'
        wallet_entry['other_party'] = wallet_entry.get(which_other_party, {'name': ''})['name']
        if len(wallet_entry[which_other_party].get('redlisted', [])) > 0:
                wallet_entry['redlisted'].append('other_party')
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
    for corporation in data_dict.get('corporation', {}).values():
        party_data[corporation.id] = {
            'id': corporation.id,
            'name': corporation.name,
            'party_type': 'corporation',
            'corporation_name': corporation.name,
            'corporation_ticker': corporation.ticker,
            'redlisted': [],
        }
        if corporation.is_redlisted:
            party_data[corporation.id]['redlisted'].extend(['name', 'corporation_name', 'corporation_ticker'])
    for character in data_dict.get('character', {}).values():
        party_data[character.id] = {
            'id': character.id,
            'name': character.name,
            'party_type': 'character',
            'corporation_name': character.corporation.name,
            'corporation_ticker': character.corporation.ticker,
            'redlisted': [],
        }
        if character.is_redlisted:
            party_data[character.id]['redlisted'].append('name')
        if character.corporation.is_redlisted:
            party_data[character.id]['redlisted'].extend(['corporation_name', 'corporation_ticker'])
    unresolved_ids = set(party_ids).difference(party_data.keys())
    for id in unresolved_ids:
        party_data[id] = {
            'id': id,
            'name': 'Unresolved party {}'.format(id),
            'party_type': 'unknown',
            'corporation_name': '',
            'corporation_ticker': '',
            'redlisted': ['name'],
        }
    return party_data


class DummyCorporation(object):
    name = None
    ticker = None
    id = None
    is_redlisted = False
    alliance_id = None
    alliance = None


class DummyAcceptor(object):
    name = 'None'
    id = 0
    is_redlisted = False
    corporation_id = None
    corporation = DummyCorporation()


def get_character_market_contracts(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    contract_list = character.get_paged_op(
        'get_characters_character_id_contracts',
        character_id=character_id,
    )
    return process_contracts(character, contract_list)


def process_contracts(character, contract_list):
    entry_items = character.get_op(
        'get_characters_character_id_contracts_contract_id_items',
        character_id=character.id,
        contract_id=[entry['contract_id'] for entry in contract_list],
    )

    type_ids = set()
    for item_list in entry_items.values():
        type_ids.update([item['type_id'] for item in item_list])
    type_dict = Type.get_multi(list(type_ids))

    location_ids = set()
    character_ids = set()
    corporation_ids = set()
    for entry in contract_list:
        if 'start_location_id' in entry:
            location_ids.add(entry['start_location_id'])
        if 'end_location_id' in entry:
            location_ids.add(entry['end_location_id'])
        character_ids.add(entry['issuer_id'])
        if entry['acceptor_id'] != 0:
            character_ids.add(entry['acceptor_id'])
        corporation_ids.add(entry['issuer_corporation_id'])
    location_dict = get_location_multi(character, list(location_ids))
    character_dict = Character.get_multi(list(character_ids))
    character_dict[0] = DummyAcceptor()
    corporation_dict = Corporation.get_multi(list(corporation_ids))
    corporation_dict[None] = DummyCorporation()

    # issuer_corporation, acceptor, issuer, end_location, start_location
    for entry in contract_list:
        entry['redlisted'] = []
        entry['items'] = entry_items[entry['contract_id']]
        items_redlisted = False
        for item in entry['items']:
            type = type_dict[item['type_id']]
            item['type_name'] = type.name
            item['redlisted'] = []
            if type.is_redlisted:
                item['redlisted'].append('type_name')
                items_redlisted = True
        if items_redlisted:
            entry['redlisted'].append('items')
        issuer_corporation = corporation_dict[entry['issuer_corporation_id']]
        entry['issuer_corporation_name'] = issuer_corporation.name
        entry['issuer_corporation_ticker'] = issuer_corporation.ticker
        entry['issuer_alliance_id'] = issuer_corporation.alliance_id
        if issuer_corporation.alliance is None:
            entry['issuer_alliance_name'] = None
        else:
            entry['issuer_alliance_name'] = issuer_corporation.alliance.name
            if issuer_corporation.alliance.is_redlisted:
                entry['redlisted'].append('issuer_alliance_name')
        if corporation_dict[entry['issuer_corporation_id']].is_redlisted:
            entry['redlisted'].append('issuer_corporation_name')
            entry['redlisted'].append('issuer_corporation_ticker')
        issuer = character_dict[entry['issuer_id']]
        entry['issuer_name'] = issuer.name
        acceptor = character_dict[entry['acceptor_id']]
        entry['acceptor_name'] = acceptor.name
        acceptor_corporation = acceptor.corporation
        entry['acceptor_corporation_id'] = acceptor_corporation.id
        entry['acceptor_corporation_name'] = acceptor_corporation.name
        entry['acceptor_corporation_ticker'] = acceptor_corporation.ticker
        entry['acceptor_alliance_id'] = acceptor_corporation.alliance_id
        if acceptor_corporation.alliance is None:
            entry['acceptor_alliance_name'] = 'None'
        else:
            entry['acceptor_alliance_name'] = acceptor_corporation.alliance.name
            if acceptor_corporation.alliance.is_redlisted:
                entry['redlisted'].append('acceptor_alliance_name')
        if acceptor_corporation.is_redlisted:
            entry['redlisted'].append('acceptor_corporation_name')
            entry['redlisted'].append('acceptor_corporation_ticker')
        if issuer.is_redlisted:
            entry['redlisted'].append('issuer_name')
        if acceptor.is_redlisted:
            entry['redlisted'].append('acceptor_name')
        if 'start_location_id' in entry:
            start_location = location_dict[entry['start_location_id']]
            entry['start_location_name'] = start_location.name
            if start_location.is_redlisted:
                entry['redlisted'].append('start_location_name')
        if 'end_location_id' in entry:
            end_location = location_dict[entry['end_location_id']]
            entry['end_location_name'] = end_location.name
            if end_location.is_redlisted:
                entry['redlisted'].append('end_location_name')

    return {'info': contract_list}


def get_character_market_history(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    order_list = list(character.get_op(
        'get_characters_character_id_orders',
        character_id=character_id,
    ))
    for entry in order_list:
        entry['is_open'] = True
    historical_orders = character.get_paged_op(
        'get_characters_character_id_orders_history',
        character_id=character_id,
    )
    for entry in historical_orders:
        entry['is_open'] = False
    order_list.extend(historical_orders)
    return process_market_history(character, order_list)


def process_market_history(character, order_list):
    location_ids = set()
    type_ids = set()
    for order in order_list:
        location_ids.add(order['location_id'])
        type_ids.add(order['type_id'])
    location_dict = get_location_multi(character, list(location_ids))
    type_dict = Type.get_multi(list(type_ids))
    for order in order_list:
        order['redlisted'] = []
        if 'is_buy_order' not in order:  # always present if True
            order['is_buy_order'] = False
        if order['is_buy_order']:
            order['price'] *= -1
        order['value'] = order['price'] * order['volume_total']
        location = location_dict[order['location_id']]
        if location.system is None:
            order['location_name'] = location.name
            order['region_name'] = 'Unknown Region'
        else:
            order['location_name'] = location.name
            order['region_name'] = location.system.region.name
            if location.system.region.is_redlisted:
                order['redlisted'].append('region_name')
        type = type_dict[order['type_id']]
        order['type_name'] = type.name
        if type.is_redlisted:
            order['redlisted'].append('type_name')
        if location.is_redlisted:
            order['redlisted'].append('location_name')
    return {'info': order_list}

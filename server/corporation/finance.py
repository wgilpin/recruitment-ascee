from models import Character, Corporation
from security import character_application_access_check
from character.finance import process_journal, process_transactions, process_contracts, process_market_history


def get_corporation_journal(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    response = character.get_op(
        'get_corporations_corporation_id_divisions',
        corporation_id=corporation_id
    )
    wallet_division_data = response['wallet']
    divisions = {entry['division']: entry.get('name', 'Division {}'.format(entry['division'])) for entry in wallet_division_data}
    return_data = []
    for division_id, division_name in divisions.items():
        entry = {'division_name': division_name}
        journal_data = character.get_paged_op(
            'get_corporations_corporation_id_wallets_division_journal',
            corporation_id=corporation_id,
            division=division_id,
        )
        entry['info'] = process_journal(character.id, journal_data)['info']
        return_data.append(entry)
    return {'info': return_data}


def get_corporation_transactions(corporation_id, highest_id=None, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    response = character.get_op(
        'get_corporations_corporation_id_divisions',
        corporation_id=corporation_id
    )
    wallet_division_data = response['wallet']
    divisions = {entry['division']: entry.get('name', 'Division {}'.format(entry['division'])) for entry in wallet_division_data}
    return_data = []
    if highest_id is None:
        kwargs = {}
    else:
        kwargs = {'highest_id': highest_id}
    for division_id, division_name in divisions.items():
        entry = {'division_name': division_name}
        transaction_data = character.get_op(
            'get_corporations_corporation_id_wallets_division_transactions',
            corporation_id=corporation_id,
            division=division_id,
            **kwargs,
        )
        entry.update(process_transactions(character, transaction_data))
        return_data.append(entry)
    return {'info': return_data}


def get_corporation_market_contracts(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    contract_list = character.get_paged_op(
        'get_corporations_corporation_id_contracts',
        corporation_id=corporation_id,
    )
    return process_contracts(character, contract_list)


def get_corporation_market_history(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    order_list = list(character.get_op(
        'get_corporations_corporation_id_orders',
        corporation_id=corporation_id,
    ))
    order_list.extend(character.get_paged_op(
        'get_corporations_corporation_id_orders_history',
        corporation_id=corporation_id,
    ))
    return process_market_history(character, order_list)

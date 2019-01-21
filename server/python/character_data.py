from .esi import get_op, get_paged_op
from .universe import get_location_name, get_corporation_name, get_alliance_name

# leaving apiCharacter.js, apiLinks.js for now


def get_character_calendar(character_id):
    calendar_data = get_op(
        'get_characters_character_id_calendar',
        auth_id=character_id, character_id=character_id
    )
    return calendar_data


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


def get_character_name(character_id):
    return get_op('get_characters_character_id', character_id=character_id)['name']


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
        entry['alliance_id'] = more_contact_data.get('alliance_id', None)
    return contacts_dict


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


def get_character_assets(character_id):
    pass


def get_character_bookmarks(character_id):
    bookmarks_list = get_paged_op(
        'get_characters_character_id_bookmarks',
        auth_id=character_id,
        character_id=character_id,
    )
    bookmarks_dict = {entry['bookmark_id']: entry for entry in bookmarks_list}
    return bookmarks_dict


def get_character_mail(character_id):
    mail_list = get_paged_op(
        'get_characters_character_id_mail',
        auth_id=character_id,
        character_id=character_id,
    )
    mail_dict = {entry['mail_id']: entry for entry in mail_list}


def get_mail_body(character_id, mail_id):
    mail_data = get_op(
        'get_characters_character_id_mail_mail_id',
        auth_id=character_id,
        character_id=character_id,
        mail_id=mail_id,
    )
    return mail_data


def get_character_market_history(character_id):
    order_list = get_paged_op(
        'get_characters_character_id_orders_history',
        auth_id=character_id,
        character_id=character_id,
    )
    return order_list


def get_character_skills(character_id):
    pass


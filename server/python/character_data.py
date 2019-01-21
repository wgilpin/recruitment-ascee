from .esi import get_op, get_paged_op

# leaving apiCharacter.js, apiLinks.js for now


def get_character_calendar(character_id):
    calendar_data = get_op(
        'get_characters_character_id_calendar',
        auth_id=character_id,
        character_id=character_id,
    )
    return calendar_data


def get_character_wallet(character_id):
    wallet_data = get_paged_op(
        'get_characters_character_id_wallet_journal',
        auth_id=character_id,
        character_id=character_id,
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
        character_id=character_id,
    )
    contacts_dict = {}
    for contact_entry in contacts_list:
        contacts_dict[contact_entry['contact_id']] = contact_entry
        contact_entry['name'] = get_character_name(contact_entry['contact_id'])
        more_contact_data = get_op(
            'get_characters_character_id', character_id=contact_entry['contact_id'],
        )
        contact_entry['corporation_id'] = more_contact_data['corporation_id']
        contact_entry['alliance_id'] = more_contact_data.get('alliance_id', None)
    pass


def get_character_market_contracts(character_id):
    pass


def get_character_assets(character_id):
    pass


def get_character_bookmarks(character_id):
    pass

def get_character_mail(character_id):
    pass

def get_mail_body(character_id, mail_id):
    pass

def get_character_market_history(character_id):
    pass

def get_character_skills(character_id):
    pass


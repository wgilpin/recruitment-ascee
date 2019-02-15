from models import Character, get_id_data
from security import character_application_access_check


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
        contacts_dict[character_id].update(get_contact_dict(
            character,
            corporation=character.corporation,
            alliance=character.corporation.alliance
        ))
    for corporation_id, corporation in sorted_contact_model_dict.get('corporation', {}).items():
        contacts_dict[corporation_id].update(get_contact_dict(
            corporation,
            corporation=corporation,
            alliance=corporation.alliance
        ))
    for alliance_id, alliance in sorted_contact_model_dict.get('alliance', {}).items():
        contacts_dict[alliance_id].update(get_contact_dict(
            alliance,
            corporation=None,
            alliance=alliance,
        ))

    return {'info': contacts_dict}


def get_contact_dict(character, corporation=None, alliance=None):
    contact_dict = {
        'name': character.name,
        'redlisted': []
    }
    if character.is_redlisted:
        contact_dict['redlisted'].append('name')
    if corporation is not None:
        contact_dict.update({
            'corporation_id': corporation.id,
            'corporation_name': corporation.name,
        })
        if corporation.is_redlisted:
            contact_dict['redlisted'].append('corporation_name')
    if alliance is not None:
        contact_dict.update({
            'alliance_id': alliance.id,
            'alliance_name': alliance.name,
        })
        if alliance.is_redlisted:
            contact_dict['redlisted'].append('alliance_name')
    return contact_dict

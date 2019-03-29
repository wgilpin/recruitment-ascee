from models import Character, Corporation
from security import character_application_access_check
from character.contacts import process_contacts


def get_corporation_contacts(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    contacts_list = character.get_paged_op(
        'get_corporations_corporation_id_contacts',
        corporation_id=corporation_id,
    )
    return process_contacts(contacts_list)

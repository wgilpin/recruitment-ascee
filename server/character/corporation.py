from character.util import get_location
from models import Character, System, Corporation
from security import character_application_access_check


def get_character_corporation_history(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    corporation_list = character.get_op(
        'get_characters_character_id_corporationhistory',
        character_id=character_id,
    )
    for entry in corporation_list:
        entry['is_deleted'] = entry.get('is_deleted', False)
        if entry['is_deleted']:
            entry['corporation_name'] = 'Deleted corp {}'.format(entry['corporation_id'])
            entry['alliance_name'] = 'Unknown'
            entry['redlisted'] = []
        else:
            corporation = Corporation.get(entry['corporation_id'])
            entry['corporation_name'] = corporation.name
            if corporation.alliance:
                entry['alliance_name'] = corporation.alliance.name
            else:
                entry['alliance_name'] = None
            redlisted_names = []
            if corporation.is_redlisted:
                redlisted_names.append('corporation_name')
            if corporation.alliance and corporation.alliance.is_redlisted:
                redlisted_names.append('alliance_name')
            if character.is_redlisted:
                redlisted_names.append('character_name')
            entry['redlisted'] = redlisted_names
    return {'info': corporation_list}

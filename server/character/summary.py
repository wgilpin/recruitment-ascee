from models import Character, Corporation, db
from security import character_application_access_check


def get_character_summary(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    character_data = character.get_op(
        'get_characters_character_id',
        character_id=character_id,
    )
    character_data['security_status'] = character_data.get('security_status', 0.)
    corporation = Corporation.get(character_data['corporation_id'])
    if character.corporation_id != corporation.id:
        character.corporation_id = corporation.id
        db.session.commit()
    character_data['corporation_name'] = corporation.name
    if corporation.alliance is not None:
        character_data['alliance_name'] = corporation.alliance.name
    else:
        character_data['alliance_name'] = None
    character_data['character_name'] = character_data.pop('name')
    character_data['character_id'] = character_id
    redlisted_names = []
    if corporation.is_redlisted:
        redlisted_names.append('corporation_name')
    if corporation.alliance and corporation.alliance.is_redlisted:
        redlisted_names.append('alliance_name')
    if character.is_redlisted:
        redlisted_names.append('character_name')
    character_data['redlisted'] = redlisted_names
    return {'info': character_data}
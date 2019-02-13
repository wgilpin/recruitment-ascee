from models import Character
from security import character_application_access_check


def get_character_calendar(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    calendar_data = character.get_op(
        'get_characters_character_id_calendar',
        character_id=character_id
    )
    return {'info': calendar_data}


def get_character_calendar_event(character_id, event_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    event_data = character.get_op(
        'get_characters_character_id_calendar_event_id',
        character_id=character_id,
        event_id=event_id,
    )
    event_data['owner_name'] = get_details_for_id(event_data['owner_id'])['name']
    return {'info': event_data}
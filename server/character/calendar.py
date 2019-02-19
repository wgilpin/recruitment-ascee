from models import Character, get_id_data
from security import character_application_access_check


def get_character_calendar(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    calendar_data = character.get_op(
        'get_characters_character_id_calendar',
        character_id=character_id
    )
    for entry in calendar_data:
        entry['event_date'] = entry['event_date'].v.isoformat()
        entry.update(
            get_character_calendar_event(
                character_id, entry['event_id'], current_user=current_user
            )
        )
        entry.pop('date')
    return {'info': calendar_data}


def get_character_calendar_event(character_id, event_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    event_data = character.get_op(
        'get_characters_character_id_calendar_event_id',
        character_id=character_id,
        event_id=event_id,
    )
    event_data['redlisted'] = []
    if event_data['owner_type'] in ('corporation', 'character', 'alliance'):
        owner = get_id_data([event_data['owner_id']], sorted=False)[event_data['owner_id']]
        if owner.is_redlisted:
            event_data['redlisted'].append('owner_name')
    return event_data


def get_details_for_id(id):
    return list(get_id_data([id], sorted=False).values())[0]

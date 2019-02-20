from models import Character, Type
from security import character_application_access_check
from character.util import get_location_multi


def get_character_industry(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    industry_job_data = character.get_op(
        'get_characters_character_id_industry_jobs',
        character_id=character_id,
    )

    type_ids = set()
    location_ids = set()
    for entry in industry_job_data:
        type_ids.add(entry['blueprint_type_id'])
        location_ids.add(entry['station_id'])

    type_dict = Type.get_multi(list(type_ids))
    location_dict = get_location_multi(character, list(location_ids))

    for entry in industry_job_data:
        type = type_dict[entry['blueprint_type_id']]
        location = location_dict[entry['station_id']]
        entry['blueprint_type_name'] = type.name
        entry['station_name'] = location.name
        entry['redlisted'] = []
        if type.is_redlisted:
            entry['redlisted'].append('blueprint_type_name')
        if location.is_redlisted:
            entry['redlisted'].append('station_name')
    return {'info': industry_job_data}

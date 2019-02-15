from models import Character, System
from security import character_application_access_check


def get_character_planetary_interaction(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    planet_data = character.get_op(
        'get_characters_character_id_planets',
        character_id=character_id,
    )
    system_ids = set()
    for entry in planet_data:
        system_ids.add(entry['solar_system_id'])
    system_dict = System.get_multi(list(system_ids))

    for entry in planet_data:
        entry['redlisted'] = []
        system = system_dict[entry['solar_system_id']]
        entry['system_name'] = system.name
        entry['region_id'] = system.region_id
        entry['region_name'] = system.region.name
        if system.is_redlisted:
            entry['redlisted'].append('system_name')
        if system.region.is_redlisted:
            entry['redlisted'].append('region_name')
    return {'info': planet_data}

from character import get_location_multi
from models import Character
from security import character_application_access_check


def get_character_clones(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    clone_data = character.get_op(
        'get_characters_character_id_clones',
        character_id=character_id
    )
    location_ids = set([clone_data['home_location']['location_id']])
    location_ids.update(entry['location_id'] for entry in clone_data['jump_clones'])
    location_dict = get_location_multi(character, location_ids)
    clone_data['home_location']['redlisted'] = []
    set_system_and_region(clone_data['home_location'], location_dict)
    for entry in clone_data['jump_clones']:
        entry['redlisted'] = []
        set_system_and_region(entry, location_dict)
    return {'info': clone_data}


def set_system_and_region(data_dict, location_dict):
    home_location = location_dict[data_dict['location_id']]
    if home_location.system is not None:
        data_dict['system_name'] = home_location.system.name
        data_dict['system_id'] = home_location.system.id
        data_dict['region_name'] = home_location.system.region.name
        data_dict['region_id'] = home_location.system.region.id
        if home_location.system.is_redlisted:
            data_dict['redlisted'].append('system_name')
        if home_location.system.region.is_redlisted:
            data_dict['redlisted'].append('region_name')
    else:
        data_dict['system_id'] = None
        data_dict['system_name'] = None
        data_dict['region_id'] = None
        data_dict['region_name'] = None

from models import Character, Type, System
from security import character_application_access_check


def get_character_fittings(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    fitting_data = character.get_op(
        'get_characters_character_id_fittings',
        character_id=character_id,
    )
    types = set()
    for entry in fitting_data:
        types.add(entry['ship_type_id'])
        for item in entry['items']:
            types.add(item['type_id'])
    type_dict = Type.get_multi(list(types))

    for entry in fitting_data:
        entry['ship_type_name'] = type_dict[entry['ship_type_id']].name
        for item in entry['items']:
            item['type_name'] = type_dict[item['type_id']].name
    return {'info': fitting_data}

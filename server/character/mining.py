from models import Character, Type, System
from security import character_application_access_check


def get_character_mining(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    mining_data = character.get_op(
        'get_characters_character_id_mining',
        character_id=character_id,
    )
    return_list = []
    for entry in mining_data:
        redlisted = []
        type = Type.get(entry['type_id'])
        system = System.get(entry['solar_system_id'])
        if system.is_redlisted:
            redlisted.append('system_name')
        return_list.append({
            'date': entry['date'].v.isoformat(),
            'quantity': entry['quantity'],
            'system_id': entry['solar_system_id'],
            'system_name': system.name,
            'type_id': entry['type_id'],
            'type_name': type.name,
            'value': entry['quantity'] * type.price,
            'redlisted': redlisted,
        })
    return {'info': return_list}

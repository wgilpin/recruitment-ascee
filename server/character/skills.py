from models import Character, Type, Group
from security import character_application_access_check


def get_character_skills(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    skill_data = character.get_op(
        'get_characters_character_id_skills',
        character_id=character_id,
    )
    queue_data = character.get_op(
        'get_characters_character_id_skillqueue',
        character_id=character_id,
    )
    for skill_list in skill_data['skills'], queue_data:
        for entry in skill_list:
            skill = Type.get(entry['skill_id'])
            group = Group.get(skill.group_id)
            entry['skill_id'] = {
                'group_name': group.name,
                'skill_name': skill.name,
            }
    return {'info': {
        'skills': skill_data['skills'],
        'queue': queue_data,
        'total_sp': skill_data['total_sp']
    }}

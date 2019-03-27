from models import Character, Type
from security import character_application_access_check
from character.util import get_location_multi
from character.industry import process_industry


def get_character_industry(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    industry_job_data = character.get_op(
        'get_characters_character_id_industry_jobs',
        character_id=character_id,
    )
    return process_industry(character, industry_job_data)

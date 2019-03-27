from models import Character, Corporation
from security import character_application_access_check
from character.industry import process_industry


def get_corporation_industry(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    industry_job_data = character.get_op(
        'get_corporations_corporation_id_industry_jobs',
        corporation_id=corporation_id,
    )
    return process_industry(character, industry_job_data)

from models import (
    Character, Type, Region, System, Corporation
)
from security import character_application_access_check
from character.assets import process_assets, process_blueprints


def get_corporation_assets(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    asset_list = character.get_paged_op(
        'get_corporations_corporation_id_assets',
        corporation_id=corporation_id,
    )
    return process_assets(character, asset_list, corporation_id=corporation_id)


def get_corporation_blueprints(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    assets = get_corporation_assets(corporation_id, current_user=current_user)
    blueprints_list = character.get_paged_op(
        'get_corporations_corporation_id_blueprints',
        corporation_id=corporation_id,
    )
    return process_blueprints(assets, blueprints_list)

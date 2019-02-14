from models import (
    Character, Type, Region, System
)
from security import character_application_access_check
from character.util import get_location_multi


def get_character_assets(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    asset_list = character.get_paged_op(
        'get_characters_character_id_assets',
        character_id=character_id,
    )
    type_set = set()
    for entry in asset_list:
        type_set.add(entry['type_id'])
    type_dict = Type.get_multi(list(type_set))
    for entry in asset_list:
        type = type_dict[entry['type_id']]
        entry['name'] = type.name
        entry['price'] = entry['quantity'] * type.price
        if type.is_redlisted:
            entry['redlisted'] = True
    return organize_assets_by_location(character, asset_list)


class DummySystem(object):
    id = -2
    name = 'Unknown System'
    region_id = None
    is_redlisted = False


class DummyRegion(object):
    id = -1
    name = 'Unknown Region'
    is_redlisted = False


def organize_assets_by_location(character, asset_list):
    asset_ids = set(entry['item_id'] for entry in asset_list)
    asset_dict = {
        entry['item_id']: entry for entry in asset_list
    }
    location_set = set(entry['location_id'] for entry in asset_list)
    location_data_dict = {id: {'items': {}} for id in location_set}
    for entry in asset_list:
        location_data_dict[entry['location_id']]['items'][entry['item_id']] = entry
    for item_id, entry in asset_dict.items():
        if item_id in location_data_dict:
            entry['items'] = location_data_dict[item_id]['items']

    location_id_list = list(set(location_data_dict.keys()).difference(asset_ids))
    location_model_dict = get_location_multi(character, location_id_list)

    systems_dict = {}
    for location_id in location_model_dict:
        location = location_model_dict[location_id]
        location_data_dict[location_id]['name'] = location.name
        if location.system_id is not None:
            system = System.get(location.system_id)
            location_data_dict[location_id]['redlisted'] = location.is_redlisted
        else:
            system = DummySystem
            # Use the raw redlisted value of location, since it can't
            # check if its system is redlisted
            location_data_dict[location_id]['redlisted'] = location.redlisted
        systems_dict[system.id] = systems_dict.get(system.id, (system, []))
        systems_dict[system.id][1].append(location_id)

    return_dict = {}
    for system, location_list in systems_dict.values():
        if system.region_id is not None:
            region = Region.get(system.region_id)
        else:
            region = DummyRegion
        if region.id not in return_dict:
            return_dict[region.id] = {
                'redlisted': region.is_redlisted,
                'name': region.name,
                'items': {},
                'id': region.id,
            }
        return_dict[region.id]['items'][system.id] = {
            'redlisted': system.is_redlisted,
            'name': system.name,
            'id': system.id,
            'items': {id: location_data_dict[id] for id in systems_dict[system.id][1]},
        }
    return return_dict

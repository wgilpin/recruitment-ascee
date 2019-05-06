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
    return process_assets(character, asset_list)


def process_assets(character, asset_list):
    type_set = set()
    for entry in asset_list:
        type_set.add(entry['type_id'])
    type_dict = Type.get_multi(list(type_set))
    item_ids = set()
    for entry in asset_list:
        type = type_dict[entry['type_id']]
        entry['name'] = type.name
        entry['price'] = type.price
        entry['redlisted'] = []
        item_ids.add(entry['item_id'])
        if type.is_redlisted:
            entry['redlisted'].append('name')
    item_names = []
    item_ids = list(item_ids)
    for i_start in range(0, len(item_ids), 1000):
        item_names.extend(
            character.get_op(
                'post_characters_character_id_assets_names',
                character_id=character.id,
                item_ids=item_ids[i_start:i_start+1000],
            )
        )
    item_names = {
        entry['item_id']: entry['name'] for entry in item_names
    }
    for entry in asset_list:
        item_id = entry['item_id']
        if item_names[item_id] != 'None' and entry['name'] != item_names[item_id]:
            entry['name'] += ' ({})'.format(item_names[item_id])
    return organize_assets_by_location(character, asset_list)


def get_character_blueprints(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    assets = get_character_assets(character_id, current_user=current_user)
    blueprints_list = character.get_paged_op(
        'get_characters_character_id_blueprints',
        character_id=character_id,
    )
    return process_blueprints(assets, blueprints_list)


def process_blueprints(assets, blueprints_list):
    asset_system_dict = get_asset_systems(assets)
    type_ids = set()
    for entry in blueprints_list:
        type_ids.add(entry['type_id'])
    type_dict = Type.get_multi(list(type_ids))
    system_dict = System.get_multi(list(set(asset_system_dict.values())))
    for entry in blueprints_list:
        entry['redlisted'] = []
        entry['is_blueprint_copy'] = entry['quantity'] == -2
        type = type_dict[entry['type_id']]
        entry['type_name'] = type.name
        if entry['item_id'] in asset_system_dict:
            entry['system_id'] = asset_system_dict[entry['item_id']]
            system = system_dict[entry['system_id']]
            entry['system_name'] = system.name
            if system.is_redlisted:
                entry['redlisted'].append('system_name')
        else:
            entry['system_id'] = -1
            entry['system_name'] = 'None'
        if type.is_redlisted:
            entry['redlisted'].append('type_name')
    return {'info': blueprints_list}


def get_asset_systems(assets):
    asset_system_dict = {}
    for region_id, region_data in assets.items():
        for system_id, system_data in region_data['items'].items():
            for item_id in get_asset_item_ids(system_data['items']):
                asset_system_dict[item_id] = system_id
    return asset_system_dict


def get_asset_item_ids(asset_tree):
    return_list = []
    for item_id, item_data in asset_tree.items():
        return_list.append(item_id)
        if 'items' in item_data.keys():
            return_list.extend(get_asset_item_ids(item_data['items']))
    return return_list


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
        if isinstance(location, System):
            system = location
        elif location.system_id is not None:
            system = System.get(location.system_id)
        else:
            system = DummySystem
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
                'redlisted': [],
                'name': region.name,
                'items': {},
                'id': region.id,
            }
            if region.is_redlisted:
                return_dict[region.id]['redlisted'].append('name')
        return_dict[region.id]['items'][system.id] = {
            'redlisted': [],
            'name': system.name,
            'id': system.id,
            'items': {id: location_data_dict[id] for id in systems_dict[system.id][1]},
        }
        if system.is_redlisted:
            return_dict[region.id]['items'][system.id]['redlisted'].append('name')
    return return_dict

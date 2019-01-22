import cachetools
from .esi import get_op
import json
import os

station_data = json.load(
    open(os.path.join(
        os.path.realpath(__file__),
        'staStations.json'
    ), 'r')
)


type_data = json.load(
    open(
    os.path.join(
        os.path.realpath(__file__),
        'typeIDs.json',
    ), 'r')
)


group_data = json.load(
    open(
    os.path.join(
        os.path.realpath(__file__),
        'groupIDs.json',
    ), 'r')
)


@cachetools.cached(cachetools.LFUCache(maxsize=10000))
def get_corporation_name(corporation_id):
    return get_op(
        'get_corporations_corporation_id',
        corporation_id=corporation_id
    )['name']


@cachetools.cached(cachetools.LFUCache(maxsize=10000))
def get_alliance_name(alliance_id):
    return get_op(
        'get_alliances_alliance_id',
        alliance_id=alliance_id,
    )['name']


def get_type_name(type_id):
    if type_id in type_data:
        return type_data[type_id]['name']
    else:
        return get_op(
            'get_universe_types_type_id',
            type_id=type_id,
        )['name']


def get_type_price(type_id):
    # Can only get prices for all types at once, so they are stored in DB
    pass


def get_region_name(region_id):
    return get_op(
        'get_universe_regions_region_id',
        region_id=region_id
    )['name']


def get_skill_name(skill_id):
    if skill_id in type_data:
        return type_data[skill_id]['name']


def get_skill_group_name(skill_id):
    if skill_id in type_data:
        group_id = type_data[skill_id]['group_id']
    else:
        group_id = get_op(
            'get_universe_types_type_id',
            type_id=skill_id
        )['group_id']
    return get_group_name(group_id)


def get_group_name(group_id):
    if group_id in group_data:
        return group_data[group_id]['name']
    else:
        return get_op(
            'get_universe_groups_group_id',
            group_id=group_id,
        )['name']


@cachetools.cached(cachetools.LRUCache(5000))
def get_station_system(station_id):
    if station_id in station_data:
        system_id = station_data[station_id]['systemID']
    else:
        system_id = get_op(
            'get_universe_stations_station_id',
            station_id=station_id,
        )['system_id']
    system_name = get_system_name(system_id)
    return system_id, system_name


@cachetools.cached(cachetools.LFUCache(10000))
def get_system_name(system_id):
    return get_op(
        'get_universe_systems_system_id',
        system_id=system_id,
    )['name']


@cachetools.cached(cachetools.LRUCache(5000))
def get_station_name(station_id):
    if station_id in station_data:
        return station_data[station_id]['name']
    else:
        return get_op(
            'get_universe_stations_station_id',
            station_id=station_id,
        )['name']


@cachetools.cached(cachetools.LRUCache(5000))
def get_structure_system(structure_id):
    system_id = get_op(
        'get_universe_structures_structure_id',
        structure_id=structure_id,
    )['system_id']
    system_name = get_system_name(system_id)
    return system_id, system_name


@cachetools.cached(cachetools.LRUCache(5000))
def get_structure_name(structure_id):
    return get_op(
        'get_universe_structures_structure_id',
        structure_id=structure_id,
    )['name']

import cachetools
from esi import get_op
import json
import os
from database import (
    Type, Corporation, System, Alliance, TypePrice, Region, Group, Station,
    Structure, Constellation, get_corporation, get_alliance
)

current_dir = os.path.dirname(os.path.abspath(__file__))

sde_station_data = json.load(
    open(os.path.join(
        current_dir,
        'staStations.json'
    ), 'r')
)


sde_type_data = json.load(
    open(
    os.path.join(
        current_dir,
        'typeIDs.json',
    ), 'r')
)


sde_group_data = json.load(
    open(
    os.path.join(
        current_dir,
        'groupIDs.json',
    ), 'r')
)


def get_location_system(location_id):
    if 60000000 <= location_id < 64000000:  # station
        return get_station_system(location_id)
    elif location_id > 50000000:  # structure
        return get_structure_system(location_id)
    else:
        raise ValueError()


def get_location_name(location_id):
    if 60000000 <= location_id < 64000000:  # station
        return get_station_name(location_id)
    elif location_id > 50000000:  # structure
        return get_structure_name(location_id)
    else:
        return "Invalid Location ID {}".format(location_id)


@cachetools.cached(cachetools.LFUCache(maxsize=10000))
def get_corporation_name(corporation_id):
    return get_corporation(corporation_id).name


@cachetools.cached(cachetools.LFUCache(maxsize=10000))
def get_alliance_name(alliance_id):
    return get_alliance(alliance_id).name


def get_type(type_id):
    type = Type.get(type_id)
    if type is None:
        type_dict = get_op(
            'get_universe_types_type_id',
            type_id=type_id,
        )
        type = Type(
            id=type_id,
            name=type_dict['name'],
            group_id=type_dict['group_id']
        )
        type.put()
    return type


@cachetools.cached(cachetools.LFUCache(40000))
def get_type_name(type_id):
    return get_type(type_id).name


@cachetools.cached(cachetools.LFUCache(40000))
def get_type_group(type_id):
    return get_type(type_id).group_id


@cachetools.cached(cachetools.LFUCache(40000))
def get_type_price(type_id):
    # Can only get prices for all types at once, so they are stored in DB
    price_data = TypePrice.get(type_id)
    if price_data is None:
        return 0.
    else:
        return price_data.price


@cachetools.cached(cachetools.LFUCache(100))
def get_region(region_id):
    region = Region.get(region_id)
    if region is None:
        region_data =  get_op(
            'get_universe_regions_region_id',
            region_id=region_id
        )
        region = Region(
            id=region_id,
            name=region_data['name'],
        )
        region.put()
    return region


@cachetools.cached(cachetools.LFUCache(100))
def get_region_name(region_id):
    return get_region(region_id).name


@cachetools.cached(cachetools.LFUCache(1000))
def get_skill_name(skill_id):
    if skill_id in sde_type_data:
        return sde_type_data[skill_id]['name']
    else:
        return get_type_name(skill_id)


@cachetools.cached(cachetools.LFUCache(1000))
def get_skill_group_name(skill_id):
    if skill_id in sde_type_data:
        group_id = sde_type_data[skill_id]['group_id']
    else:
        group_id = get_type_group(skill_id)
    return get_group_name(group_id)


@cachetools.cached(cachetools.LFUCache(1000))
def get_group_name(group_id):
    if group_id in sde_group_data:
        return sde_group_data[group_id]['name']
    else:
        group = Group.get(group_id)
        if group is None:
            group_data = get_op(
                'get_universe_groups_group_id',
                group_id=group_id,
            )
            group = Group(id=group_id, name=group_data['name'])
            group.put()
        return group.name


@cachetools.cached(cachetools.LRUCache(5000))
def get_station_system(station_id):
    if station_id in sde_station_data:
        system_id = sde_station_data[station_id]['systemID']
    else:
        station = Station.get(station_id)
        if station is None:
            station_data = get_op(
                'get_universe_stations_station_id',
                station_id=station_id,
            )['system_id']
            station = Station(
                id=station_id,
                system_id=station_data['system_id'],
                name=station_data['name'],
            )
            station.put()
    system_name = get_system_name(system_id)
    return system_id, system_name


def get_system(system_id):
    system = System.get(system_id)
    if system is None:
        system_data = get_op(
            'get_universe_systems_system_id',
            system_id=system_id,
        )
        system = System(
            id=system_id,
            constellation_id=system_data['constellation_id'],
            name=system_data['name'],
        )
        system.put()
    return system


@cachetools.cached(cachetools.LFUCache(1000))
def get_constellation(constellation_id):
    constellation = Constellation.get(constellation_id)
    if constellation is None:
        constellation_data = get_op(
            'get_universe_constellations_constellation_id',
            constellation_id=constellation_id,
        )
        constellation = Constellation(
            id=constellation_id,
            region_id=constellation_data['region_id'],
            name=constellation_data['name'],
        )
        constellation.put()
    return constellation


@cachetools.cached(cachetools.LFUCache(10000))
def get_system_name(system_id):
    return get_system(system_id).name


@cachetools.cached(cachetools.LRUCache(5000))
def get_station_name(station_id):
    if station_id in sde_station_data:
        return sde_station_data[station_id]['name']
    else:
        station = Station.get(station_id)
        if station is None:
            station_data = get_op(
                'get_universe_stations_station_id',
                station_id=station_id,
            )['system_id']
            station = Station(
                id=station_id,
                system_id=station_data['system_id'],
                name=station_data['name'],
            )
            station.put()
        return station.name


@cachetools.cached(cachetools.LRUCache(5000))
def get_structure_system(structure_id):
    structure = Structure.get(structure_id)
    if structure is None:
        structure_data = get_op(
            'get_universe_structures_structure_id',
            structure_id=structure_id,
        )
        structure = Structure(
            id=structure_id,
            name=structure_data['name'],
            system_id=structure_data['solar_system_id'],
            corporation_id=structure_data['owner_id']
        )
        structure.put()
    system_name = get_system_name(structure.system_id)
    return structure.system_id, system_name


@cachetools.cached(cachetools.LRUCache(5000))
def get_structure_name(structure_id):
    structure = Structure.get(structure_id)
    if structure is None:
        structure_data = get_op(
            'get_universe_structures_structure_id',
            structure_id=structure_id,
        )
        structure = Structure(
            id=structure_id,
            name=structure_data['name'],
            system_id=structure_data['solar_system_id'],
            corporation_id=structure_data['owner_id']
        )
        structure.put()
    return structure.name

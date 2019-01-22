import cachetools
from .esi import get_op


@cachetools.cached(cachetools.LFUCache(maxsize=10000))
def get_location_name(location_id):
    pass

@cachetools.cached(cachetools.LFUCache(maxsize=1000))
def get_location_system(location_id):
    pass

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
    pass


def get_type_price(type_id):
    pass


def get_region_name(region_id):
    pass


def get_skill_name(skill_id):
    pass


def get_skill_group(skill_id):
    pass


def get_station_system(station_id):
    pass


def get_station_name(station_id):
    pass


def get_structure_system(structure_id):
    pass


def get_structure_name(structure_id):
    pass

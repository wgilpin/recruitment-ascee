import cachetools
from .esi import get_op


@cachetools.cached(cachetools.LFUCache(maxsize=10000))
def get_location_name(location_id):
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

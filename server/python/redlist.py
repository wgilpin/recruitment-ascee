from universe import get_system, get_region, get_constellation, get_type, system_is_redlisted
from database import get_character, get_type, get_corporation, get_alliance
import cachetools


@cachetools.cached(cachetools.LRUCache(5000))
def character_is_redlisted(character_id):
    character = get_character(character_id)
    if character.redlisted:
        return True
    else:
        return corporation_is_redlisted(character.corporation_id)


@cachetools.cached(cachetools.LFUCache(1000))
def corporation_is_redlisted(corporation_id):
    corporation = get_corporation(corporation_id)
    if corporation.redlisted:
        return True
    elif corporation.alliance_id is None:
        return False
    else:
        return get_alliance(corporation.alliance_id).redlisted


@cachetools.cached(cachetools.LFUCache(20000))
def type_is_redlisted(type_id):
    return get_type(type_id).redlisted

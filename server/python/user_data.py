from character_data import (
    get_character_wallet, get_character_name, get_character_contacts,
    get_character_calendar, get_character_market_contracts,
    get_character_bookmarks, get_character_mail,
)
from database import Character
import cachetools


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_character_list(user_id):
    query = Character.get(Character.user_id == user_id)
    character_dict = {}
    for character in query.run():
        character_dict[character.character_id] = {
            'name': character.name,
            'corporation_id': character.corporation_id
        }
    return {'info': character_dict}


def get_user_wallet(user_id):
    return get_user_info_list(user_id, get_character_wallet)


def get_user_market_contracts(user_id):
    return get_user_info_list(user_id, get_character_market_contracts)


def get_user_info_list(user_id, character_function):
    return_dict = {'info': []}
    for character_id in get_character_id_list(user_id):
        entry_list = character_function(character_id)
        for entry in entry_list:
            entry['character_id'] = character_id
            entry['character_name'] = get_character_name(character_id)
            return_dict['info'].append(entry)
    return return_dict


def get_user_calendar(user_id):
    calendar_dict = {}
    for character_id in get_character_id_list(user_id):
        new_calendar_data = get_character_calendar(character_id)['info']
        for entry in new_calendar_data:
            entry['character_id'] = character_id
            entry['character_name'] = get_character_name(character_id)
            calendar_dict[entry['event_id']] = entry
    return {'info': list(calendar_dict.values())}


def get_user_contacts(user_id):
    return get_user_dict(user_id, get_character_contacts)


def get_user_bookmarks(user_id):
    return get_user_dict(user_id, get_character_bookmarks)


def get_user_mail(user_id):
    return get_user_dict(user_id, get_character_mail)


def get_user_dict(user_id, character_function):
    return_dict = {}
    for character_id in get_character_id_list(user_id):
        for key, entry in character_function(character_id).items():
            if key not in return_dict:
                entry['character_id'] = character_id
                entry['character_name'] = get_character_name(character_id)
                return_dict[key] = entry
    return return_dict

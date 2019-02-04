from character_data import (
    get_character_wallet, get_character_contacts,
    get_character_calendar, get_character_market_contracts,
    get_character_bookmarks, get_character_mail,
)
from models import Character, Corporation
import cachetools
import logging





def get_user_wallet(user_id):
    return get_user_info_list(user_id, get_character_wallet)


def get_user_market_contracts(user_id):
    return get_user_info_list(user_id, get_character_market_contracts)


def get_user_info_list(user_id, character_function):
    return_dict = {'info': []}
    for character in get_character_list(user_id):
        entry_list = character_function(character.id)
        for entry in entry_list:
            entry['character_id'] = character.id
            entry['character_name'] = character.name
            return_dict['info'].append(entry)
    return return_dict


def get_user_calendar(user_id):
    calendar_dict = {}
    for character in get_character_list(user_id):
        new_calendar_data = get_character_calendar(character.id)['info']
        for entry in new_calendar_data:
            entry['character_id'] = character.id
            entry['character_name'] = character.name
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
    for character in get_character_list(user_id):
        for key, entry in character_function(character.id).items():
            if key not in return_dict:
                entry['character_id'] = character.id
                entry['character_name'] = character.name
                return_dict[key] = entry
    return return_dict

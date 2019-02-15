from character.util import get_location
from models import Character, System
from security import character_application_access_check


def get_character_bookmarks(character_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    bookmarks_list = character.get_paged_op(
        'get_characters_character_id_bookmarks',
        character_id=character_id,
    )
    folder_list = character.get_paged_op(
                'get_characters_character_id_bookmarks_folders',
                character_id=character_id)
    folders = { folder['folder_id']: folder['name'] for folder in folder_list }
    bookmarks_dict = {entry['bookmark_id']: entry for entry in bookmarks_list}
    for bookmark_id, entry in bookmarks_dict.items():
        entry['redlisted'] = []
        if 'folder_id' in entry.keys():
            if entry['folder_id'] in folders:
                esi_folder_name = folders[entry['folder_id']]
                if esi_folder_name == 'Null':
                    esi_folder_name = 'Personal Locations'
                entry['folder_name'] = esi_folder_name
            else:
                entry['folder_name'] = 'Personal Locations'
        location = get_location(character, entry['location_id'])
        if isinstance(location, System):
            entry['system_id'] = location.id
            entry['system_name'] = location.name
            if location.is_redlisted:
                entry['redlisted'].append('system_name')
        else:
            entry['system_id'] = location.system_id
            entry['system_name'] = location.system.name
            if entry.system.is_redlisted:
                entry['redlisted'].append('system_name')
    return {'info': bookmarks_dict}

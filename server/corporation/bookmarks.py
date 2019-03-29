from models import Character, System, Corporation
from security import character_application_access_check
from character.bookmarks import process_bookmarks


def get_corporation_bookmarks(corporation_id, current_user=None):
    corporation = Corporation.get(corporation_id)
    character = Character.get(corporation.ceo_id)
    character_application_access_check(current_user, character)
    bookmarks_list = character.get_paged_op(
        'get_corporations_corporation_id_bookmarks',
        corporation_id=corporation_id,
    )
    folder_list = character.get_paged_op(
                'get_corporations_corporation_id_bookmarks_folders',
                corporation_id=corporation_id)
    return process_bookmarks(bookmarks_list, folder_list)

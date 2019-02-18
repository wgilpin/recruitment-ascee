from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from character.bookmarks import get_character_bookmarks


@app.route('/api/character/<int:character_id>/bookmarks', methods=['GET'])
@login_required
def api_character_bookmarks(character_id):
    """
    Get bookmarks for a given character.

    Returned dictionary is of the form
    {'info': [bookmark_1, bookmark_2, ...]}. Each bookmark is as returned by
    ESI, with the additional keys
        `id` (same as bookmark_id),
        `folder_name` (if `folder_id` is present),
        `system_id`,
        `system_name`.e.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_bookmarks(character_id, current_user=current_user))

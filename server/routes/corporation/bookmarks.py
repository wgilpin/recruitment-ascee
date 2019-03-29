from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from corporation.bookmarks import get_corporation_bookmarks


@app.route('/api/corporation/<int:corporation_id>/bookmarks', methods=['GET'])
@login_required
def api_corporation_bookmarks(corporation_id):
    """
    Get bookmarks for a given corporation.

    Returned dictionary is of the form
    {'info': [bookmark_1, bookmark_2, ...]}. Each bookmark is as returned by
    ESI, with the additional keys
        `id` (same as bookmark_id),
        `folder_name` (if `folder_id` is present),
        `system_id`,
        `system_name`.e.

    Args:
        corporation_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_corporation_bookmarks(corporation_id, current_user=current_user))

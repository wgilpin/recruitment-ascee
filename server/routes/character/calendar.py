from flask_login import login_required, current_user
from flask_app import app
from flask import jsonify
from character.calendar import get_character_calendar, \
    get_character_calendar_event


@app.route('/api/character/<int:character_id>/calendar/<int:event_id>', methods=['GET'])
@login_required
def api_character_calendar_event(character_id, event_id):
    """
    Get calendar event details for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by
    ESI, with the additional key `redlisted` whose value is True if the entry
    is owned by a redlisted entity.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(
        get_character_calendar_event(character_id, event_id, current_user=current_user)
    )


@app.route('/api/character/<int:character_id>/calendar', methods=['GET'])
@login_required
def api_character_calendar(character_id):
    """
    Get calendar entries for a given character.

    Returned dictionary is of the form
    {'info': [entry_1, entry_2, ...]}. Each entry is as returned by
    ESI, with the additional key `redlisted` whose value is True if the entry
    is owned by a redlisted entity.

    Args:
        character_id (int)

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter or
            a recruiter who has claimed the given user
    """
    return jsonify(get_character_calendar(character_id, current_user=current_user))


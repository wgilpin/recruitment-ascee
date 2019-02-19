from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify
from recruitment import get_applicant_list, get_user_characters, get_users


@app.route('/api/applicant_list/')
@login_required
def api_get_applicant_list():
    """
    Gets the list of all applicants, including accepted and rejected applicants.

    Returns:
        response (dict)

    Example:
        response = {
            'info': {
                '1937622137': {
                    'user_id': 1937622137,  # int character ID of user's main
                    'name': Twine Endashi,  # string character name of user's main
                    'recruiter_id': 201837771,  # int character ID of recruiter's main
                    'recruiter_name': 'Recruiter Ralph',  # string name of recruiter
                    'status': 'claimed' | 'new' | 'escalated',
                },
                '876876876': {
                    [...]
                }
            ]
        }

    Error codes:
        Forbidden (403): If logged in user is not a recruiter or senior recruiter
    """
    return jsonify(get_applicant_list(current_user=current_user))


@app.route('/api/user/characters/')
@app.route('/api/user/characters/<int:user_id>')
@login_required
def api_get_user_characters(user_id=None):
    """
    Gets a list of all characters for a given user.

    Characters are redlisted if they are directly redlisted, or if they are
    in a corporation or alliance that is redlisted.

    Args:
        user_id: User key of a user

    Returns:
        response (dict)

    Example:
        response = {
            'info': {
                1937622137: {  # Character ID
                    'name': 'Applicant Abigail',  # character name
                    'corporation_name': 'Corporation Calico',  # corporation name
                    'redlisted': True,  # might only be present if redlisted.
                },
                [...]
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not a senior recruiter,
            a recruiter who has claimed the given user, or the user themself
    """
    if not user_id:
        user_id = current_user.get_id()
    return jsonify(get_user_characters(user_id, current_user=current_user))


@app.route('/api/admin/users/')
@login_required
def api_users():
    """
    Get information on all registered users.

    Returned data is of the form {'info': [user_1, user_2, ...]}. Each user
    dictionary has the keys `id`, `name`, `is_admin`, `is_senior_recruiter`,
    and `is_recruiter`.

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not an admin.
    """
    return jsonify(get_users(current_user=current_user))

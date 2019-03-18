from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify, request
from admin import set_roles
from recruitment import get_users

def query_param_to_python(param_string):
    # convert javascript true/false to python bool if needed
    if param_string == 'false':
        return False
    if param_string == 'true':
        return True
    return param_string


@app.route('/api/admin/<int:user_id>/set_roles')
@login_required
def api_set_roles(user_id):
    """
    Sets roles of a given user.

    If senior_recruiter is set to True, recruiter will be ignored as an input.
    If the parameters are not given, that role will be unchanged.

    Args:
        user_id (int)
            if missing/None uses the logged in user
        recruiter (bool, optional)
        senior_recruiter (bool, optional)
        admin (bool, optional)

    Returned data is of the form {'info': [user_1, user_2, ...]}. Each user
    dictionary has the keys `id`, `name`, `is_admin`, `is_senior_recruiter`,
    and `is_recruiter`.

    Returns:
        response (dict)

    Error codes:
        Forbidden (403): If logged in user is not an admin.
    """
    recruiter = query_param_to_python(request.args.get('recruiter', None))
    senior_recruiter = query_param_to_python(request.args.get('senior_recruiter', None))
    admin = query_param_to_python(request.args.get('admin', None))
    set_result = set_roles(
        user_id,
        is_recruiter=recruiter,
        is_senior_recruiter=senior_recruiter,
        is_admin=admin,
        current_user=current_user,
    )

    if set_result.get('status','') == 'ok':
        return jsonify(get_users(current_user=current_user))
    return set_result


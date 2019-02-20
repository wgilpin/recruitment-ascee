from flask_login import current_user
from security import login_required
from flask_app import app
from flask import jsonify, request
from admin import set_roles


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

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin.
    """
    recruiter = request.args.get('recruiter', None)
    senior_recruiter = request.args.get('senior_recruiter', None)
    admin = request.args.get('admin', None)
    return jsonify(
        set_roles(
            user_id,
            is_recruiter=recruiter,
            is_senior_recruiter=senior_recruiter,
            is_admin=admin,
            current_user=current_user,
        )
    )

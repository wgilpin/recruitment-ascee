from flask import jsonify
from security import login_required, user_admin_access_check
from models import Character, Corporation
from flask_app import app
from flask_login import current_user


@app.route('/api/admin/refresh_db', methods=['GET'])
@login_required
def api_admin_refresh_db():
    """
    Refreshes database entities using ESI.

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin
    """
    user_admin_access_check(current_user)
    Corporation.refresh_from_esi()
    Character.refresh_from_esi()
    return jsonify({'status': 'ok'})

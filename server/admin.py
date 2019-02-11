from models import db
from models import List, ListItem, list_kinds
from flask import jsonify
from flask_app import app
from flask_login import login_required, current_user
from security import user_admin_access_check
from exceptions import ForbiddenException, BadRequestException
from datetime import date, datetime
from json import dumps

SECONDS_TO_CACHE = 10 * 60

@app.route('/api/admin/list/<string:kind>', methods=['GET'])
@login_required
def api_admin_list(kind):
    """
    Gets a specified redlist

    Args:
        kind (string)

    Returns:
        response (array) of
        {
            id (int),
            name (string),
        }

    Error codes:
        Forbidden (403): If logged in user is not an admin
    """
    return jsonify(get_admin_list(kind, current_user=current_user))

def get_admin_list(kind, current_user=None):
    user_admin_access_check(current_user)
    if not kind in list_kinds:
        raise BadRequestException('Unknown Redlist')
    response = []
    the_list = List.get_by_kind(kind)
    if the_list:
        for item in the_list.items:
            response.append({ 'id': item.id, 'name': item.name })
    return {'info': response}
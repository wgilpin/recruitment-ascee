from models import db
from models import List, ListItem, list_kinds
from flask import jsonify, request
from flask_app import app
from flask_login import login_required, current_user
from security import user_admin_access_check
from exceptions import ForbiddenException, BadRequestException
from datetime import date, datetime
from json import dumps

SECONDS_TO_CACHE = 10 * 60

@app.route('/api/admin/list/<string:kind>/add', methods=['PUT'])
@login_required
def api_admin_list_add_item(kind):
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
    return jsonify(
        add_admin_list_item(kind, request.args.get('items'), current_user=current_user))

@app.route('/api/admin/list/<string:kind>/replace', methods=['PUT'])
@login_required
def api_admin_list_replace(kind):
    """
    Gets or sets a specified redlist

    Args:
        kind (string)
        items: list of { id (int), name (string) }

    Returns
        200

    Error codes:
        Forbidden (403): If logged in user is not an admin
    """
    return jsonify(
        set_admin_list(
            kind, request.args.get('items'), replace=True, current_user=current_user))

@app.route('/api/admin/list/<string:kind>', methods=['GET', 'PUT'])
@login_required
def api_admin_list(kind):
    """
    Gets or sets a specified redlist

    Args:
        kind (string)
        (PUT only) items: list of { id (int), name (string) }

    Returns
    (GET):
        response (array) of
        {
            id (int),
            name (string),
        }
    (PUT):
        { 'status': 'ok}

    Error codes:
        Forbidden (403): If logged in user is not an admin
        BadRequest (400): If list type is not known
    """
    if request.method == 'GET':
        return jsonify(get_admin_list(kind, current_user=current_user))
    return jsonify(
        set_admin_list(
            kind, request.args.get('items'), replace=False, current_user=current_user))

@app.route('/api/admin/list/<string:kind>/delete/<int:item_id>', methods=['DELETE'])
@login_required
def api_admin_list_delete_item(kind, item_id):
    """
    removes an item from the specified redlist

    Args:
        kind (string)
        item_id (int)

    Returns:
        200

    Error codes:
        Forbidden (403): If logged in user is not an admin
        BadRequest (400): If item not in list
    """
    return jsonify(remove_admin_list_item(kind, item_id, current_user=current_user))

def set_admin_list(kind, items, replace, current_user=None):
    user_admin_access_check(current_user)
    if not kind in list_kinds:
        raise BadRequestException('Unknown Redlist')
    the_list = List.get_by_kind(kind)
    if the_list:
        if replace:
            # wipe the list first
            for item in the_list.items:
                db.session.delete(item)
            the_list.items = []
        # add the new items to the list
        for item in items:
            db.session.add(ListItem(id=item.id, name=item.name, list_id=the_list.id))
        db.session.commit()
    return {'status': 'ok'}

def add_admin_list_item(kind, item, current_user=None):
    user_admin_access_check(current_user)
    if not kind in list_kinds:
        raise BadRequestException('Unknown Redlist')
    the_list = List.get_by_kind(kind)
    if the_list:
        db.session.add(ListItem(id=item.id, name=item.name, list_id=the_list.id))
        db.session.commit()
    return {'status': 'ok'}

def remove_admin_list_item(kind, item_id, current_user=None):
    user_admin_access_check(current_user)
    if not kind in list_kinds:
        raise BadRequestException('Unknown Redlist')
    the_list = List.get_by_kind(kind)
    item = ListItem.query.filter_by(id=item_id, list_id=the_list.id).one_or_none()
    if not item:
        raise BadRequestException(f'Item {item_id} not found in List {kind}')
    db.session.delete(item)
    db.session.commit()
    return {'status': 'ok'}

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
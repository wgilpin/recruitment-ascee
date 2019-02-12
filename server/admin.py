from models import db, Character, Type, System, Corporation, Alliance, Region
from flask import jsonify, request
from flask_app import app
from flask_login import login_required, current_user
from security import user_admin_access_check
from exceptions import ForbiddenException, BadRequestException
from sqlalchemy import exists

SECONDS_TO_CACHE = 10 * 60

kind_dict = {
    'character': Character,
    'type': Type,
    'channel': None,
    'alliance': Alliance,
    'corporation': Corporation,
    'system': System,
    'region': Region,
}


@app.route('/api/admin/list/<string:kind>/add', methods=['PUT'])
@login_required
def api_admin_list_add_item(kind):
    """
    Add an item to a specified redlist.

    Args:
        kind (string)
        item:  { id (int), name (string) }

    Returns:
        200 if OK

    Error codes:
        Forbidden (403): If logged in user is not an admin
    """
    return jsonify(
        add_admin_list_item(kind, request.args.get('item')['id'], current_user=current_user)
    )


@app.route('/api/admin/list/<string:kind>/replace', methods=['PUT'])
@login_required
def api_admin_list_replace(kind):
    """
    Replaces a specified redlist with the supplied items.

    Args:
        kind (string)
        items: list of { id (int), name (string) }

    Returns
        200

    Error codes:
        Forbidden (403): If logged in user is not an admin
    """
    return jsonify(
        put_admin_list(
            kind, [item['id'] for item in request.args.get('items')],
            do_replace=True, current_user=current_user)
    )


@app.route('/api/admin/list/<string:kind>', methods=['GET'])
@login_required
def api_get_admin_list(kind):
    """
    Gets a specified redlist.

    Args:
        kind (string)

    Returns
    (GET):
        response (array) of
        {
            id (int),
            name (string),
        }

    Error codes:
        Forbidden (403): If logged in user is not an admin
        BadRequest (400): If list type is not known
    """
    return jsonify(get_admin_list(kind, current_user=current_user))


@app.route('/api/admin/list/<string:kind>', methods=['PUT'])
@login_required
def api_put_admin_list(kind):
    """
    Adds items to a specified redlist.

    Args:
        kind (string)
        items: list of { id (int), name (string) }

    Returns
    (GET):
        response (array) of
        {
            id (int),
            name (string),
        }
    (PUT):
        {'status': 'ok}

    Error codes:
        Forbidden (403): If logged in user is not an admin
        BadRequest (400): If list type is not known
    """
    return jsonify(
        put_admin_list(
            kind, [item['id'] for item in request.args.get('items')], current_user=current_user)
    )


@app.route('/api/admin/list/<string:kind>/delete/<int:item_id>', methods=['DELETE'])
@login_required
def api_admin_list_delete_item(kind, item_id):
    """
    Removes an item from the specified redlist

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


def put_admin_list(kind, item_id_list, do_replace, current_user=None):
    user_admin_access_check(current_user)
    if kind not in kind_dict:
        raise BadRequestException('Unknown Redlist')
    for item_id in item_id_list:
        if db.session.query(
                kind_dict[kind]).filter(kind_dict[kind].id==item_id).one_or_none() is None:
            raise BadRequestException(
                f"Item {item_id} of kind {kind} does not exist in database.")
    if do_replace:
        for item in db.session.query(kind_dict[kind]).filter_by(redlisted=True):
            item.redlisted = False
    for item in db.session.query(kind_dict[kind]).filter(
            kind_dict[kind].id.in_(item_id_list)):
        item.redlisted = True
    db.session.commit()
    return {'status': 'ok'}


def add_admin_list_item(kind, item, current_user=None):
    return put_admin_list(kind, [item], do_replace=False, current_user=current_user)


def remove_admin_list_item(kind, item_id, current_user=None):
    user_admin_access_check(current_user)
    if kind not in kind_dict:
        raise BadRequestException('Unknown Redlist')
    item = db.session.query(kind_dict[kind]).filter_by(id=item_id).one_or_none()
    if item is None:
        raise BadRequestException(f'Item {item_id} not found in List {kind}')
    elif not item.redlisted:
        raise BadRequestException(f'Item {item_id} not found in List {kind}')
    else:
        item.redlisted = False
        db.session.commit()
        return {'status': 'ok'}


def get_admin_list(kind, current_user=None):
    user_admin_access_check(current_user)
    if kind not in kind_dict:
        raise BadRequestException(f'Unknown Redlist {kind}')
    response = []
    redlisted_items = db.session.query(kind_dict[kind]).filter_by(redlisted=True)
    for item in redlisted_items:
        response.append({'id': item.id, 'name': item.name})
    return {'info': response}

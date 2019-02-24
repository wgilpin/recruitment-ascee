from flask import jsonify, request
from security import login_required
from admin_list import add_admin_list_item, put_admin_list, get_admin_list, remove_admin_list_item
from flask_app import app
from flask_login import current_user


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
            kind, [item['id'] for item in request.get_json()['items']],
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
            kind, [item['id'] for item in request.get_json()['items']], do_replace=False, current_user=current_user)
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
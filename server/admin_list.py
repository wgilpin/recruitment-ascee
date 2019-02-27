from models import db, Character, Type, System, Corporation, Alliance, Region
from security import user_admin_access_check
from exceptions import ForbiddenException, BadRequestException

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

from models import db, Character, Type, System, Corporation, Alliance, Region, User, Recruiter, Admin
from flask_app import app
from security import user_admin_access_check
from exceptions import BadRequestException, ForbiddenException
from sqlalchemy import exists

SECONDS_TO_CACHE = 10 * 60

kind_dict = {
    'character': Character,
    'type': Type,
    'alliance': Alliance,
    'corporation': Corporation,
    'system': System,
    'region': Region,
}


def set_roles(
        user_id, is_recruiter=None, is_senior_recruiter=None, is_admin=None,
        current_user=None):
    user_admin_access_check(current_user)
    user = User.get(user_id)
    if is_senior_recruiter:
        if not user.recruiter:
            db.session.add(Recruiter(id=user.id, is_senior=True))
        elif not user.recruiter.is_senior:
            user.recruiter.is_senior = True
    elif is_recruiter:
        if not user.recruiter:
            db.session.add(Recruiter(id=user.id, is_senior=True))
    elif is_recruiter == False and user.recruiter:
        remove_recruiter(user.recruiter)
    if is_senior_recruiter == False and user.recruiter and user.recruiter.is_senior:
        user.recruiter.is_senior = False

    if is_admin and not user.admin:
        db.session.add(Admin(id=user.id))
    elif is_admin == False and user.admin:
        db.session.delete(user.admin)
    db.session.commit()
    return {'status': 'ok'}


def remove_recruiter(recruiter):
    for app in recruiter.applications:
        app.recruiter_id = None
    db.session.delete(recruiter)
    db.session.commit()


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
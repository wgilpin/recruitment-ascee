from models import db, Recruiter, User, Admin
from security import user_admin_access_check


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

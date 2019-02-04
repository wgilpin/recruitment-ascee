from models import User, Character, Admin, Recruiter, Application, db
from exceptions import ForbiddenException


def ensure_has_access(user_id, target_user_id, self_access=False):
    if not has_access(user_id, target_user_id, self_access=self_access):
        raise ForbiddenException(
            'User {} does not have access to target user {}'.format(
                user_id, target_user_id)
        )


def is_admin(user):
    return db.session.query(db.exists().where(Admin.user_id == user.id)).scalar()


def is_recruiter(user):
    return db.session.query(db.exists().where(Recruiter.user_id == user.id)).scalar()


def is_senior_recruiter(user):
    return db.session.query(db.exists().where(db.and_(Recruiter.user_id == user.id, Recruiter.is_senior))).scalar()


def has_applicant_access(user, target_user, self_access=False):
    if self_access and (user.id == target_user.id):
        return_value = True
    elif db.session.query(
            db.exists().where(db.and_(
                Recruiter.user==user, Recruiter.is_senior)
            )
            ).scalar():
        # Requesting user is senior recruiter
        return_value = True
    elif db.session.query(
            db.exists().where(db.and_(
                Application.user_id==target_user.id,
                Application.recruiter_id==user.id,
                Application.is_concluded==False)
            )
            ).scalar():
        # Requesting user is recruiter who claimed application
        return_value = True
    else:
        return_value = False
    return return_value


def has_access(user_id, target_character_id, self_access=False):
    target_character = Character.get(target_character_id)
    user = User.get(user_id)
    target_user = User.get(target_character.user_id)
    if user.is_admin:
        return True
    elif self_access and (user_id == target_character.user_id):
        return True
    elif user.is_senior_recruiter and target_user.is_applicant:
        return True
    elif user.is_recruiter and target_user.is_applicant and (target_user.recruiter_id == user.get_id()):
        return True
    else:
        return False
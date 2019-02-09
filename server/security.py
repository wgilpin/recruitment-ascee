from models import User, Character, Admin, Recruiter, Application, db
from exceptions import ForbiddenException, BadRequestException


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


def is_applicant_character_id(character_id):
    character = db.session.query(Character).filter(
        Character.id == character_id
    ).join(
        User, User.id == Character.user_id
    ).join(
        Application, Application.user_id == User.id,
    ).filter(
        db.not_(Application.is_concluded)
    ).first()
    return character is not None


def character_application_access_check(current_user, target_character):
    if not has_applicant_access(current_user, target_character.user):
        raise ForbiddenException(
            'User {} does not have access to character {}'.format(
                current_user.id, target_character.id
            )
        )
    elif not is_applicant_character_id(target_character.id):
        raise BadRequestException(
            'Character {} is not in an open application.'.format(
                target_character.id
            )
        )


def user_application_access_check(current_user, target_user):
    if Application.get_for_user(target_user.id) is None:
        raise BadRequestException(
            'User {} is not in an open application.'.format(
                target_user.id
            )
        )
    elif not has_applicant_access(current_user, target_user):
        raise ForbiddenException(
            'User {} does not have access to applicant {}'.format(
                current_user.id, target_user.id
            )
        )


def has_applicant_access(user, target_user, self_access=False):
    return_value = False
    if self_access and (user.id == target_user.id):
        return_value = True
    elif db.session.query(
            db.exists().where(db.and_(
                Recruiter.user==user, Recruiter.is_senior)
            )
            ).scalar():
        # Requesting user is senior recruiter
        return_value = True
    else:
        application = Application.query.filter_by(user_id=target_user.id, is_concluded=False).one_or_none()
        if application and application.recruiter_id == user.id:
            # Requesting user is recruiter who claimed application
            return_value = True
        elif application and not application.recruiter_id:
            # unclaimed application
            return_value = True
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
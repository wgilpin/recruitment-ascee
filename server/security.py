from models import User, Character
from exceptions import ForbiddenException


def ensure_has_access(user_id, target_user_id, self_access=False):
    if not has_access(user_id, target_user_id, self_access=self_access):
        raise ForbiddenException(
            'User {} does not have access to target user {}'.format(
                user_id, target_user_id)
        )


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
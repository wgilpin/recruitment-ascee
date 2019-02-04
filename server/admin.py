from models import User, Character


def get_user_list():
    # list of all Users with roles
    result = {}
    for user in User.query().run():
        id = user.get_id()
        user_name = Character.get(id).name if id else None
        result[id] = {
            'user_id': id,
            'is_recruiter': user.is_recruiter,
            'is_snr_recruiter': user.is_senior_recruiter,
            'is_admin': user.is_admin,
            'name': user_name,
        }
    return result

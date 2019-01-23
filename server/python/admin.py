from database import User, Character


def get_users():
    return_list = []
    for user in User.query():
        return_list.append({
            'id': user.id,
            'is_admin': user.is_admin,
            'is_recruiter': user.is_recruiter,
            'is_senior_recruiter': user.is_senior_recruiter,
            'name': Character.get_by_id(user.main_character_id).name,
        })
    return {'info': return_list}

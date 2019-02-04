from models import User, Character


async def get_users():
    return_list = []
    for user in User.query().run():
        return_list.append({
            'id': user.get_id(),
            'is_admin': user.is_admin,
            'is_recruiter': user.is_recruiter,
            'is_senior_recruiter': user.is_senior_recruiter,
            'name': Character.get(user.get_id()).name,
        })
    return {'info': return_list}

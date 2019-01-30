from database import User, Character


async def get_users():
    return_list = []
    for user in User.query().run():
        print('id', user.id, user.name)
    for user in User.query().run():
        return_list.append({
            'id': user.id,
            'is_admin': user.is_admin,
            'is_recruiter': user.is_recruiter,
            'is_senior_recruiter': user.is_senior_recruiter,
            'name': Character.get(user.id).name,
        })
    return {'info': return_list}

from models import Alliance, Character, Corporation, Type, Region, System, Station
from esi import get_op
from security import is_admin, is_recruiter
from exceptions import ForbiddenException, BadRequestException


category_dict = {
    'alliance': Alliance,
    'character': Character,
    'corporation': Corporation,
    'inventory_type': Type,
    'region': Region,
    'solar_system': System,
    'system': System,
    'station': Station,
}


def get_search_results(category, search, current_user=None):
    if category == 'system':
        category = 'solar_system'
    if not is_admin(current_user) and not is_recruiter(current_user):
        raise ForbiddenException('User not permitted to use search.')
    elif category not in category_dict:
        raise BadRequestException(
            'Category {} is not one of the valid categories {}'.format(
                category, list(category_dict.keys())
            )
        )
    else:
        response = get_op(
            'get_search',
            categories=[category],
            search=search,
            disable_multi=True
        )
        if category in response:
            id_list = response[category]
            item_dict = category_dict[category].get_multi(id_list)
            return {'info': {
                row.id: row.name for _, row in item_dict.items()
            }}
        else:
            return {'info': {}}


def get_names_to_ids(category, name_list, current_user=None):
    if not is_admin(current_user) and not is_recruiter(current_user):
        raise ForbiddenException('User not permitted to use search.')
    elif category not in category_dict:
        raise BadRequestException(
            'Category {} is not one of the valid categories {}'.format(
                category, list(category_dict.keys())
            )
        )
    else:
        result = get_op(
            'post_universe_ids',
            names=name_list,
            disable_multi=True
        )
        category_key = f'{category}s'
        if category_key in result:
            result = result[category_key]
            return {'info': {item['name']: item['id'] for item in result}}
        else:
            return {'info': {}}


def get_ids_to_names(id_list, current_user=None):
    if not is_admin(current_user) and not is_recruiter(current_user):
        raise ForbiddenException('User not permitted to use search.')
    elif len(id_list) > 0:
        result = get_op(
            'post_universe_names',
            ids=id_list,
            disable_multi=True
        )
        return_dict = {}
        for data in result:
            entry = {
                'name': data['name'],
            }
            if data['category'] in category_dict:
                entry['redlisted'] = category_dict[data['category']].get(data['id']).is_redlisted
            else:
                entry['redlisted'] = False
            return_dict[data['id']] = entry
        return {'info': return_dict}
    else:
        return {'info': {}}

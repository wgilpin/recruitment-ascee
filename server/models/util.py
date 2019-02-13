from esi import get_op
from models.eve import Corporation, Character, Alliance, Region, System, Station


model_name_dict = {
    'alliance': Alliance,
    'character': Character,
    'corporation': Corporation,
    'region': Region,
    'solar_system': System,
    'station': Station,
}


def get_id_data(id_list):
    sorted_ids = sort_ids_by_category(id_list)
    return_data = {}
    # alliance, character, constellation, corporation, inventory_type, region, solar_system, station
    for id_type, id_list in sorted_ids.items():
        if id_type in model_name_dict:
            return_data[id_type] = model_name_dict[id_type].get_multi(id_list)
    return return_data


def sort_ids_by_category(ids):
    ids = tuple(ids)
    data = []
    for i in range(0, len(ids), 1000):
        data.extend(get_op(
            'post_universe_names', ids=ids[i:i+1000]
        ))
    return_dict = {}
    for item in data:
        category = item['category']
        if category not in return_dict:
            return_dict[category] = []
        return_dict[category].append(item['id'])
    return return_dict
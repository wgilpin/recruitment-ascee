from models import (
    Station, Structure, System
)


def get_location(character, location_id):
    return get_location_multi(character, [location_id])[location_id]


def get_location_multi(character, location_id_list):
    station_id_list = []
    structure_id_list = []
    system_id_list = []
    for location_id in location_id_list:
        if 60000000 <= location_id < 64000000:  # station
            station_id_list.append(location_id)
        elif 30000000 < location_id < 32000000:  # system
            system_id_list.append(location_id)
        elif location_id > 50000000:  # structure
            structure_id_list.append(location_id)
        else:
            raise ValueError(
                'location_id {} does not correspond to station'
                ', system, or structure'.format(location_id)
            )
    location_dict = {}
    location_dict.update(Station.get_multi(station_id_list))
    location_dict.update(System.get_multi(system_id_list))
    location_dict.update(Structure.get_multi(character, structure_id_list))
    return location_dict

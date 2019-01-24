import cachetools
from esi import get_op
import json
import os
from database import (
    Type, Corporation, System, Alliance, TypePrice, Region, Group, Station,
    Structure, Constellation, get_corporation, get_alliance
)


def organize_assets_by_location(asset_list):
    asset_dict = {
        entry['item_id']: entry for entry in asset_list
    }
    location_set = set(entry['location_id'] for entry in asset_list)
    location_dict = {id: [] for id in location_set}
    for entry in asset_list:
        location_dict[entry['location_id']].append(entry)
    for item_id, entry in asset_dict.items():
        if item_id in location_dict:
            entry['items'] = location_dict[item_id]

    systems_dict = {}
    for location_id in location_dict:
        try:
            system = get_location_system(location_id)
            systems_dict[system.id] = systems_dict.get(system.id, (system, []))
            systems_dict[system.id][1].append(location_id)
        except IOError:  # replace with exception raised if location_id is not a station/structure
            # can only (easliy) figure this out by getting the exception
            pass

    return_dict = {}
    for system, location_list in systems_dict.items():
        constellation = get_constellation(system.constellation_id)
        region = get_region(constellation.region_id)
        if region.id not in return_dict:
            return_dict[region.id] = {
                'redlisted': region.redlisted,
                'name': region.name,
                'items': {}
            }
        if system.id not in return_dict[region.id]['items']:
            return_dict[region.id]['items'][system.id] = {
                'redlisted': system_is_redlisted(system.id),
                'name': system.name,
                'items': location_dict[system.id]
            }

    return return_dict

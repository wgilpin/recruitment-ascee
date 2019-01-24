import cachetools
from esi import get_op
from anom import Model, props, set_adapter
from anom.adapters import DatastoreAdapter, MemcacheAdapter
from esi import get_op
import os
import pylibmc

memcache_client = pylibmc.Client(
    ['localhost'], binary=True, behaviors={'cas': True})
datastore_adapter = DatastoreAdapter()
memcache_adapter = MemcacheAdapter(memcache_client, datastore_adapter)
set_adapter(memcache_adapter)


class Recruiter(Model):
    user_id = props.Integer(indexed=True)


class User(Model):

    id = props.Integer(indexed=True)
    is_admin = props.Bool(default=False)
    is_recruiter = props.Bool(default=False)
    is_senior_recruiter = props.Bool(default=False)
    is_applicant = props.Bool()


class Type(Model):
    id = props.Integer(indexed=True)
    group_id = props.Integer(indexed=True)
    name = props.String()
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        type = super(Type, cls).get(id, *args, **kwargs)
        if type is None:
            type_dict = get_op(
                'get_universe_types_type_id',
                type_id=id,
            )
            type = Type(
                id=id,
                name=type_dict['name'],
                group_id=type_dict['group_id']
            )
            type.put()
        return type

    @property
    def is_redlisted(self):
        return self.redlisted


class Group(Model):
    id = props.Integer(indexed=True)
    name = props.String(optional=True)

    @classmethod
    def get(cls, id, *args, **kwargs):
        group = super(Group, cls).get(id, *args, **kwargs)
        if group is None:
            group_data = get_op(
                'get_universe_groups_group_id',
                group_id=id,
            )
            group = Group(id=id, name=group_data['name'])
            group.put()
        return group


class TypePrice(Model):
    id = props.Integer(indexed=True)
    price = props.Float(default=0.)

    @classmethod
    def get(cls, id, *args, **kwargs):
        type_price = super(TypePrice, cls).get(id, *args, **kwargs)
        if type_price is None:
            type_price = TypePrice(
                id=id,
                price=0.
            )
            type_price.put()
        return type_price


class Region(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        region = super(Region, cls).get(id, *args, **kwargs)
        if region is None:
            region_data = get_op(
                'get_universe_regions_region_id',
                region_id=id
            )
            region = Region(
                id=id,
                name=region_data['name'],
            )
            region.put()
        return region

    @property
    def is_redlisted(self):
        return self.redlisted


class System(Model):
    id = props.Integer(indexed=True)
    region_id = props.Integer(indexed=True)
    name = props.String()
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        system = super(System, cls).get(id, *args, **kwargs)
        if system is None:
            system_data = get_op(
                'get_universe_systems_system_id',
                system_id=id,
            )
            constellation_data = get_op(
                'get_universe_constellations_constellation_id',
                constellation_id=system_data['constellation_id'],
            )
            system = System(
                id=id,
                region_id=constellation_data['region_id'],
                name=system_data['name'],
            )
            system.put()
        return system

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            region = Region.get(self.region_id)
            return region.is_redlisted


class Station(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    system_id = props.Integer(indexed=True)
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        station = super(Station, cls).get(id, *args, **kwargs)
        if station is None:
            station_data = get_op(
                'get_universe_stations_station_id',
                station_id=id,
            )['system_id']
            station = Station(
                id=id,
                system_id=station_data['system_id'],
                name=station_data['name'],
            )
            station.put()
        return station

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            return System.get(self.system_id).is_redlisted


class Structure(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    system_id = props.Integer(indexed=True)
    corporation_id = props.Integer(indexed=True)
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        structure = super(Station, cls).get(id, *args, **kwargs)
        if structure is None:
            structure_data = get_op(
                'get_universe_structures_structure_id',
                structure_id=id,
            )
            # Will also need code here to return "unknown" structure if no access
            # it should probably be located in "unknown" system and region? add to DB?
            structure = Structure(
                id=id,
                name=structure_data['name'],
                system_id=structure_data['solar_system_id'],
                corporation_id=structure_data['owner_id']
            )
            structure.put()
        return structure

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            return System.get(self.system_id).is_redlisted


def get_location(location_id):
    if 60000000 <= location_id < 64000000:  # station
        return Station.get(location_id)
    elif location_id > 50000000:  # structure
        return Structure.get(location_id)
    else:
        raise ValueError(
            'location_id {} does not correspond to station'
            ' or structure'.format(location_id)
        )


class Corporation(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    ticker = props.String()
    alliance_id = props.Integer(indexed=True, optional=True)
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        corporation = super(Corporation, cls).get(id, *args, **kwargs)
        if corporation is None:
            corporation_data = get_op(
                'get_corporations_corporation_id',
                corporation_id=id,
            )
            corporation = Corporation(
                id=id,
                name=corporation_data['name'],
                ticker=corporation_data['ticker']
            )
            if 'alliance_id' in corporation_data:
                corporation.alliance_id = corporation_data['alliance_id']
            corporation.put()
        return corporation

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        elif hasattr(self, 'alliance_id'):
            assert self.alliance_id is not None
            return Alliance.get(self.alliance_id).is_redlisted
        else:
            return False


class Question(Model):
    id = props.Integer(indexed=True)
    text = props.String()


class Answer(Model):
    question_id = props.Integer(indexed=True)
    user_id = props.Integer(indexed=True)
    text = props.Text()


class Alliance(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    ticker = props.String()
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        alliance = super(Alliance, cls).get(id, *args, **kwargs)
        if alliance is None:
            alliance_data = get_op(
                'get_alliances_alliance_id',
                alliance_id=id,
            )
            alliance = Alliance(
                id=id,
                name=alliance_data['name'],
                ticker=alliance_data['ticker']
            )
            alliance.put()
        return alliance

    def is_redlisted(self):
        return self.redlisted


class Recruit(Model):
    user_id = props.Integer(indexed=True)
    recruiter_id = props.Integer(indexed=True, optional=True)
    status = props.Integer(indexed=True, default=0)
    notes = props.String(default='')


class Character(Model):
    id = props.Integer(indexed=True)
    user_id = props.Integer(indexed=True, optional=True)
    name = props.String()
    corporation_id = props.Integer(indexed=True)
    is_male = props.Bool()
    refresh_token = props.String(optional=True)
    redlisted = props.Bool(default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        character = super(Character, cls).get(id, *args, **kwargs)
        if character is None:
            character_data = get_op(
                'get_characters_character_id',
                character_id=id
            )
            character = Character(
                id=id,
                name=character_data['name'],
                is_male=character_data['gender'] == 'male',
                corporation_id=character_data['corporation_id'],
            )
        return character

    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            return Corporation.get(self.corporation_id).is_redlisted

from anom import props, set_adapter, Key, Model
from anom.adapters import DatastoreAdapter, MemcacheAdapter
import os
import pylibmc
import datetime
from esipy import EsiClient, EsiSecurity
from esipy.cache import DictCache
from pyswagger import App
from esi_config import client_id, secret_key, callback_url, client_name
from flask_login import UserMixin


memcache_client = pylibmc.Client(
    ['localhost'], binary=True, behaviors={'cas': True})
datastore_adapter = DatastoreAdapter()
memcache_adapter = MemcacheAdapter(memcache_client, datastore_adapter)
set_adapter(memcache_adapter)


class AsceeModel(Model):
    def get_id(self):
        return self.key.int_id


class User(AsceeModel, UserMixin):
    is_admin = props.Bool(indexed=True, default=False)
    is_recruiter = props.Bool(indexed=True, default=False)
    is_senior_recruiter = props.Bool(indexed=True, default=False)
    recruiter_id = props.Integer(indexed=True, optional=True)
    status_level = props.Integer(indexed=True, default=0)
    name = props.String(default="Unknown")

    STATUS_LIST = ('new', 'claimed', 'escalated', 'accepted', 'rejected')

    @property
    def status(self):
        return User.STATUS_LIST[self.status_level]

    @classmethod
    def is_applicant_query(cls):
        return not (cls.is_recruiter or cls.is_senior_recruiter or cls.is_admin)

    @property
    def is_applicant(self):
        return not (self.is_recruiter or self.is_senior_recruiter or self.is_admin)

    @status.setter
    def status(self, value):
        self.status_level = User.STATUS_LIST.index(value)

    @classmethod
    def get(cls, id, *args, **kwargs):
        user = super(User, cls).get(id, *args, **kwargs)
        if user is None:
            user = User(key=Key(User, id))
            user.put()
        return user


class Type(AsceeModel):
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
                key=Key(Type, id),
                name=type_dict['name'],
                group_id=type_dict['group_id']
            )
            type.put()
        return type

    @property
    def is_redlisted(self):
        return self.redlisted


class Group(AsceeModel):
    name = props.String(optional=True)

    @classmethod
    def get(cls, id, *args, **kwargs):
        group = super(Group, cls).get(id, *args, **kwargs)
        if group is None:
            group_data = get_op(
                'get_universe_groups_group_id',
                group_id=id,
            )
            group = Group(key=Key(Group, id), name=group_data['name'])
            group.put()
        return group



class TypePrice(AsceeModel):
    price = props.Float(default=0.)

    @classmethod
    def get(cls, id, *args, **kwargs):
        type_price = super(TypePrice, cls).get(id, *args, **kwargs)
        if type_price is None:
            type_price = TypePrice(
                key=Key(TypePrice, id),
                price=0.
            )
            type_price.put()
        return type_price



class Region(AsceeModel):
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
                key=Key(Region, id),
                name=region_data['name'],
            )
            region.put()
        return region

    @property
    def is_redlisted(self):
        return self.redlisted


class System(AsceeModel):
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
                key=Key(System, id),
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


class Station(AsceeModel):
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
                key=Key(Station, id),
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


class Structure(AsceeModel):
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
                key=Key(Structure, id),
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


class Corporation(AsceeModel):
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
                key=Key(Corporation, id),
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


class Question(AsceeModel):
    text = props.String()


class Answer(AsceeModel):
    question_id = props.Integer(indexed=True)
    user_id = props.Integer(indexed=True)
    text = props.Text()


class Alliance(AsceeModel):
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
                key=Key(Alliance, id),
                name=alliance_data['name'],
                ticker=alliance_data['ticker']
            )
            alliance.put()
        return alliance

    def is_redlisted(self):
        return self.redlisted

class Character(AsceeModel):
    user_id = props.Integer(indexed=True)
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
                key=Key(Character, id),
                user_id=id,
                name=character_data.get('name', f'unknown {id}'),
                is_male=character_data.get('gender', '') == 'male',
                corporation_id=character_data.get('corporation_id', 0),
            )
            character.put()
        return character

    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            return Corporation.get(self.corporation_id).is_redlisted

#  Cache in a file because it takes a while to load
current_dir = os.path.dirname(os.path.abspath(__file__))
app_data_filename = os.path.join(current_dir, 'esi_app.pkl')

# if os.path.isfile(app_data_filename):
esi_app = App.create('https://esi.evetech.net/latest/swagger.json')
    # pickle.dump(esi_app, open(app_data_filename, 'wb'))
# else:
#     esi_app = pickle.load(open(app_data_filename, 'rb'))

client_dict = {}


def get_esi_client(auth_id=None):
    if auth_id not in client_dict:
        client_dict[auth_id] = initialize_esi_client(auth_id)
    return client_dict[auth_id]


def initialize_esi_client(auth_id=None):
    """
    Retrieves a public or authorized ESI client.

    Args:
        auth_id (optional): character_id of the user whose client we want to
            retrieve. By default, a public ESI client is returned.

    Returns:
        esi_client (EsiClient): Client object from esipy.
    """
    auth = EsiSecurity(
        headers={'User-Agent': client_name},
        redirect_uri='https://localhost/callback',
        client_id=client_id,
        secret_key=secret_key,
    )
    if auth_id is not None:
        auth.refresh_token = Character.get(auth_id).refresh_token
    esi_client = EsiClient(
        auth,
        retry_requests=True,
        cache=DictCache(),
        headers={'User-Agent': client_name},
    )
    return esi_client


class ESIError(Exception):
    pass


def get_op(op_name, auth_id=None, **kwargs):
    esiClient = get_esi_client(auth_id)
    response = esiClient.request(esi_app.op[op_name](**kwargs))
    if isinstance(response, dict) and 'error' in response.keys():
        raise ESIError(response['error'])
    else:
        return response.data


def get_paged_op(op_name, auth_id=None, **kwargs):
    esi_client = get_esi_client(auth_id)
    response = esi_client.request(esi_app.op[op_name](page=1, **kwargs))
    return_list = []
    return_list.extend(response.data)
    try:
        assert len(response.header['X-Pages']) == 1
        pages = int(response.header['X-Pages'][0])
    except KeyError:
        print('No page numbers given in getPagedOp, request {}, {}'.format(op_name, kwargs))
        print('Response: {}'.format(response))
        return []

    operations = [
        esi_app.op[op_name](page=page, **kwargs) for page in range(2, pages+1)
    ]

    result_list = []
    for request, response in esi_client.multi_request(operations):
        result_list.extend(response.data)

    return return_list

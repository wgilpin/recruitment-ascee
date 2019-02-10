from models.database import db
from esi import get_op, get_paged_op, ESIError


class Group(db.Model):
    __tablename__ = 'group'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(64))

    @classmethod
    def get(cls, id):
        group = db.session.query(cls).get(id)
        if group is None:
            group_data = get_op(
                'get_universe_groups_group_id',
                group_id=id,
            )
            group = Group(id=id, name=group_data['name'])
            db.session.add(group)
            db.session.commit()
        return group

    @classmethod
    def get_multi(cls, id_list):
        existing_items = db.session.query(Group).filter(
            Group.id.in_(id_list))
        return_items = {item.id: item for item in existing_items}
        missing_ids = set(id_list).difference(
            [item.id for item in existing_items])
        new_data_dict = get_op(
            'get_universe_groups_group_id',
            group_id=list(missing_ids)
        )
        for group_id, group_data in new_data_dict.items():
            group = Group(
                id=group_id,
                name=group_data['name'],
            )
            db.session.add(group)
            return_items[group_id] = group
        db.session.commit()
        return return_items

def get_prices(types):
    price_list = get_op('get_markets_prices')
    prices = {}
    for price in price_list:
        if price['type_id'] in types:
            prices[price['type_id']] = price['adjusted_price']
    return prices

class Type(db.Model):
    __tablename__ = 'type'
    id = db.Column(db.Integer, primary_key=True)
    group_id = db.Column(db.Integer, db.ForeignKey(Group.id))
    name = db.Column(db.String(100))
    redlisted = db.Column(db.Boolean, default=False)
    price = db.Column(db.Float, default=0.)

    @classmethod
    def get(cls, id):
        type = db.session.query(cls).get(id)
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
            db.session.add(type)
            db.session.commit()
        return type

    @classmethod
    def get_multi(cls, id_list):
        existing_items = db.session.query(Type).filter(
            Type.id.in_(id_list))
        return_items = {item.id: item for item in existing_items}
        missing_ids = set(id_list).difference(
            [item.id for item in existing_items])
        new_data_dict = get_op(
            'get_universe_types_type_id',
            type_id=list(missing_ids)
        )
        group_ids = set(item['group_id'] for item in new_data_dict.values())
        Group.get_multi(list(group_ids))
        if (len(missing_ids)>0):
            prices = get_prices(missing_ids)
            for type_id, type_data in new_data_dict.items():
                type = Type(
                    id=type_id,
                    name=type_data['name'],
                    group_id=type_data['group_id'],
                    price = prices[type_id] if type_id in prices else 0
                )
                db.session.add(type)
                return_items[type_id] = type
            db.session.commit()
        return return_items

    @property
    def is_redlisted(self):
        return self.redlisted


class Region(db.Model):
    __tablename__ = 'region'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50))
    redlisted = db.Column(db.Boolean, default=False)

    @classmethod
    def get(cls, id):
        region = db.session.query(cls).get(id)
        if region is None:
            region_data = get_op(
                'get_universe_regions_region_id',
                region_id=id
            )
            region = Region(
                id=id,
                name=region_data['name'],
            )
            db.session.add(region)
            db.session.commit()
        return region

    @property
    def is_redlisted(self):
        return self.redlisted


class System(db.Model):
    __tablename__ = 'system'
    id = db.Column(db.Integer, primary_key=True)
    region_id = db.Column(db.Integer, db.ForeignKey(Region.id))
    region = db.relationship(Region, uselist=False)
    name = db.Column(db.String(100))
    redlisted = db.Column(db.Boolean, default=False)

    @classmethod
    def get(cls, id):
        system = db.session.query(cls).get(id)
        if system is None:
            system_data = get_op(
                'get_universe_systems_system_id',
                system_id=id,
            )
            constellation_data = get_op(
                'get_universe_constellations_constellation_id',
                constellation_id=system_data['constellation_id'],
            )
            region = Region.get(constellation_data['region_id'])
            system = System(
                id=id,
                region_id=constellation_data['region_id'],
                name=system_data['name'],
            )
            db.session.add(system)
            db.session.commit()
        return system

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            region = Region.get(self.region_id)
            return region.is_redlisted


class Station(db.Model):
    __tablename__ = 'station'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    system_id = db.Column(db.Integer, db.ForeignKey(System.id))
    system = db.relationship(System, uselist=False)
    redlisted = db.Column(db.Boolean, default=False)

    @classmethod
    def get(cls, id):
        station = db.session.query(cls).get(id)
        if station is None:
            station_data = get_op(
                'get_universe_stations_station_id',
                station_id=id,
            )
            station = Station(
                id=id,
                system_id=station_data['system_id'],
                name=station_data['name'],
            )
            db.session.add(station)
            db.session.commit()
        return station

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            return System.get(self.system_id).is_redlisted


class Alliance(db.Model):
    __tablename__ = 'alliance'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    ticker = db.Column(db.String(20))
    redlisted = db.Column(db.Boolean, default=False)

    @classmethod
    def get(cls, id, *args, **kwargs):
        alliance = db.session.query(cls).get(id)
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
            db.session.add(alliance)
            db.session.commit()
        return alliance

    @classmethod
    def get_multi(cls, id_list):
        existing_items = db.session.query(Alliance).filter(
            Alliance.id.in_(id_list))
        return_items = {item.id: item for item in existing_items}
        missing_ids = set(id_list).difference(
            [item.id for item in existing_items])
        new_data_dict = get_op(
            'get_alliances_alliance_id',
            alliance_id=list(missing_ids)
        )
        for alliance_id, data in new_data_dict.items():
            alliance = Alliance(
                id=alliance_id,
                name=data['name'],
                ticker=data['ticker']
            )
            db.session.add(alliance)
            return_items[alliance_id] = alliance
        db.session.commit()
        return return_items

    def is_redlisted(self):
        return self.redlisted


class Corporation(db.Model):
    __tablename__ = 'corporation'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    ticker = db.Column(db.String(20))
    alliance_id = db.Column(db.Integer, db.ForeignKey(Alliance.id))
    alliance = db.relationship(Alliance, uselist=False)
    redlisted = db.Column(db.Boolean, default=False)

    @classmethod
    def get(cls, id):
        corporation = db.session.query(cls).get(id)
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
            if corporation_data.get('alliance_id', None) is not None:
                alliance = Alliance.get(corporation_data['alliance_id'])
                corporation.alliance_id = corporation_data['alliance_id']
            db.session.add(corporation)
            db.session.commit()
        return corporation

    @classmethod
    def get_multi(cls, id_list):
        existing_items = db.session.query(Corporation).filter(
            Corporation.id.in_(id_list))
        return_items = {item.id: item for item in existing_items}
        missing_ids = set(id_list).difference(
            [item.id for item in existing_items])
        new_data_dict = get_op(
            'get_corporations_corporation_id',
            corporation_id=list(missing_ids)
        )
        alliance_ids = set()
        for corp_data in new_data_dict.values():
            if 'alliance_id' in corp_data:
                alliance_ids.add(corp_data['alliance_id'])
        alliances = Alliance.get_multi(list(alliance_ids))
        for corporation_id, corporation_data in new_data_dict.items():
            corporation = Corporation(
                id=corporation_id,
                name=corporation_data['name'],
                ticker=corporation_data['ticker']
            )
            if corporation_data.get('alliance_id', None) is not None:
                corporation.alliance_id = corporation_data['alliance_id']
            db.session.add(corporation)
            return_items[corporation_id] = corporation
        db.session.commit()
        return return_items

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        elif self.alliance is not None and self.alliance.is_redlisted:
            return True
        else:
            return False


class Structure(db.Model):
    __tablename__ = 'structure'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    system_id = db.Column(db.Integer, db.ForeignKey(System.id), nullable=True)
    system = db.relationship(System, foreign_keys=[system_id])
    corporation_id = db.Column(db.Integer, db.ForeignKey(Corporation.id), nullable=True)
    corporation = db.relationship(Corporation, uselist=False)
    redlisted = db.Column(db.Boolean, default=False)

    @classmethod
    def get(cls, character, id):
        structure = db.session.query(cls).get(id)
        if structure is None:
            try:
                structure_data = character.get_op(
                    'get_universe_structures_structure_id',
                    structure_id=id,
                )
                structure = Structure(
                    id=id,
                    name=structure_data['name'],
                    system_id=structure_data['solar_system_id'],
                    corporation_id=structure_data['owner_id']
                )
            except ESIError:
                structure = Structure(
                    id=id,
                    name='Unknown Structure {}'.format(id),
                )
            # Will also need code here to return "unknown" structure if no access
            # it should probably be located in "unknown" system and region? add to DB?
            db.session.add(structure)
            db.session.commit()
        return structure

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            return self.system.is_redlisted


class Character(db.Model):
    __tablename__ = 'character'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=True)
    user = db.relationship("User", uselist=False, back_populates='characters')
    name = db.Column(db.String(100))
    corporation_id = db.Column(db.Integer, db.ForeignKey(Corporation.id))
    corporation = db.relationship(Corporation, uselist=False)
    refresh_token = db.Column(db.Text, nullable=True)
    redlisted = db.Column(db.Boolean, default=False)
    blocked_from_applying = db.Column(db.Boolean, default=False)

    def __init__(self, *args, **kwargs):
        super(Character, self).__init__(*args, **kwargs)

    @classmethod
    def get(cls, id):
        character = db.session.query(cls).get(id)
        if character is None:
            character_data = get_op(
                'get_characters_character_id',
                character_id=id
            )
            corporation = Corporation.get(character_data['corporation_id'])
            character = Character(
                id=id,
                user_id=id,
                name=character_data['name'],
                corporation_id=character_data['corporation_id'],
            )
            db.session.add(character)
            db.session.commit()
        return character

    @classmethod
    def get_multi(cls, id_list):
        existing_items = db.session.query(Character).filter(
            Character.id.in_(id_list))
        return_items = {item.id: item for item in existing_items}
        missing_ids = set(id_list).difference(
            [item.id for item in existing_items])
        new_data_dict = get_op(
            'get_characters_character_id',
            character_id=list(missing_ids)
        )
        corporation_ids = set(char['corporation_id'] for char in new_data_dict.values())
        corporations = Corporation.get_multi(list(corporation_ids))
        for character_id, character_data in new_data_dict.items():
            character = Character(
                id=character_id,
                name=character_data['name'],
                corporation_id=character_data['corporation_id'],
            )
            db.session.add(character)
            return_items[character_id] = character
        db.session.commit()
        return return_items

    def get_op(self, op_name, **kwargs):
        return get_op(op_name, refresh_token=self.refresh_token, **kwargs)

    def get_paged_op(self, op_name, **kwargs):
        return get_paged_op(op_name, refresh_token=self.refresh_token, **kwargs)

    @property
    def is_redlisted(self):
        if self.redlisted:
            return True
        else:
            return Corporation.get(self.corporation_id).is_redlisted

def get_details_for_id(contact_id):
    entry = {
        'name': None,
        'corporation_id': None,
        'corporation_name': None,
        'alliance_id': None,
        'alliance_name': None,
        'redlisted': None,
        }
    try:
        contact = Character.get(contact_id)
        entry['name'] = contact.name
        entry['corporation_id'] = contact.corporation_id
        corporation = Corporation.get(contact.corporation_id)
        entry['corporation_name'] = corporation.name
        if corporation.alliance_id:
            entry['alliance_id'] = corporation.alliance_id
            entry['alliance_name'] = Alliance.get(corporation.alliance_id).name
        if contact.is_redlisted:
            entry['redlisted'] = True
    except ESIError as E:
        # try corp
        try:
            corporation = Corporation.get(contact_id)
            entry['name'] = corporation.name
            entry['corporation_id'] = contact_id
            entry['corporation_name'] = corporation.name
            if corporation.alliance_id:
                entry['alliance_id'] = corporation.alliance_id
                entry['alliance_name'] = Alliance.get(corporation.alliance_id).name
            if corporation.is_redlisted:
                entry['redlisted'] = True
        except ESIError as E:
            # try alliance
            try:
                alliance = Alliance.get(contact_id)
                entry['name'] = alliance.name
                entry['alliance_id'] = contact_id
                entry['alliance_name'] = alliance.name
                if alliance.is_redlisted:
                    entry['redlisted'] = True
            except ESIError as E:
                raise E
    for prop in list(entry):
        if entry[prop] == None:
            del entry[prop]
    return entry
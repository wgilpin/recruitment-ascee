import cachetools
from esi import get_op
from anom import Model, props


import os

print('ENV {}'.format(os.environ['GOOGLE_APPLICATION_CREDENTIALS']))

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


class Group(Model):
    id = props.Integer(indexed=True)
    name = props.String(optional=True)


class TypePrice(Model):
    id = props.Integer(indexed=True)
    price = props.Float(optional=True)


class Region(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    redlisted = props.Bool(default=False)


class System(Model):
    id = props.Integer(indexed=True)
    region_id = props.Integer(indexed=True)
    name = props.String()
    redlisted = props.Bool(default=False)


class Constellation(Model):
    id = props.Integer(indexed=True)
    region_id=props.Integer(indexed=True)
    name = props.String()


class Station(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    system_id = props.Integer(indexed=True)


class Structure(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    system_id = props.Integer(indexed=True)
    corporation_id = props.Integer(indexed=True)
    redlisted = props.Bool(default=False)


class Corporation(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    ticker = props.String()
    alliance_id = props.Integer(indexed=True, optional=True)
    redlisted = props.Bool(default=False)


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


@cachetools.cached(cachetools.LRUCache(maxsize=10000))
def get_character(character_id):
    character = Character.get(character_id)
    if character is None:
        character_data = get_op(
            'get_characters_character_id',
            character_id=character_id
        )
        character = Character(
            id=character_id,
            name=character_data['name'],
            is_male=character_data['gender'] == 'male',
            corporation_id=character_data['corporation_id'],
        )
    return character


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_corporation(corporation_id):
    corporation = Corporation.get(corporation_id)
    if corporation is None:
        corporation_data = get_op(
            'get_corporations_corporation_id',
            corporation_id=corporation_id,
        )
        corporation = Corporation(
            id=corporation_id,
            name=corporation_data['name'],
            ticker=corporation_data['ticker']
        )
        if 'alliance_id' in corporation_data:
            corporation.alliance_id = corporation_data['alliance_id']
        corporation.put()
    return corporation


@cachetools.cached(cachetools.LRUCache(maxsize=1000))
def get_alliance(alliance_id):
    alliance = Alliance.get(alliance_id)
    if alliance is None:
        alliance_data = get_op(
            'get_alliances_alliance_id',
            alliance_id=alliance_id,
        )
        alliance = Alliance(
            id=alliance_id,
            name=alliance_data['name'],
            ticker=alliance_data['ticker']
        )
        alliance.put()
    return alliance

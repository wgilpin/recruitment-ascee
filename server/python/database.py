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


class Corporation(Model):
    id = props.Integer(indexed=True)
    name = props.String()
    ticker = props.String()
    alliance_id = props.Integer(indexed=True, optional=True)


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

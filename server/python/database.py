from google.appengine.ext import ndb


class Recruiter(ndb.Model):
    user_id = ndb.IntegerProperty(required=True)


class User(ndb.Model):
    main_character_id = ndb.IntegerProperty(required=True)
    is_admin = ndb.BooleanProperty(default=False)
    is_recruiter = ndb.BooleanProperty(default=False)
    is_senior_recruiter = ndb.BooleanProperty(default=False)


class Type(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    group_id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)


class Group(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)


class TypePrice(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    price = ndb.FloatProperty(required=True)


class Region(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    redlisted = ndb.StringProperty(default=False)


class System(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)


class Station(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    system_id = ndb.IntegerProperty(required=True)


class Structure(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    system_id = ndb.IntegerProperty(required=True)
    corporation_id = ndb.IntegerProperty(required=True)


class Corporation(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    ticker = ndb.StringProperty(required=True)
    alliance_id = ndb.StringProperty()


class Question(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    text = ndb.StringProperty(required=True)


class Answer(ndb.Model):
    question_id = ndb.IntegerProperty(required=True)
    user_id = ndb.IntegerProperty(required=True)
    text = ndb.StringProperty(required=True)


class Alliance(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    ticker = ndb.StringProperty(required=True)


class Recruit(ndb.Model):
    user_id = ndb.IntegerProperty(required=True)
    recruiter_id = ndb.IntegerProperty()
    status = ndb.IntegerProperty()
    notes = ndb.StringProperty(default='')


class Character(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    user_id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    corporation_id = ndb.IntegerProperty(required=True)
    is_male = ndb.BooleanProperty(required=True)
    refresh_token = ndb.StringProperty()

from google.appengine.ext import ndb


class Recruiter(ndb.Model):
    user_id = ndb.IntegerProperty(required=True)


class User(ndb.Model):
    main_character_id = ndb.IntegerProperty(required=True)
    is_admin = ndb.BooleanProperty(default=False)
    is_recruiter = ndb.BooleanProperty(default=False)
    is_senior_recruiter = ndb.BooleanProperty(default=False)
    character_ids = ndb.IntegerProperty(repeated=True)


class Type(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)


class System(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)


class Corporation(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)
    alliance_id = ndb.StringProperty()


class Question(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    text = ndb.StringProperty(required=True)


class Answer(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    user_id = ndb.IntegerProperty(required=True)
    text = ndb.StringProperty(required=True)


class Alliance(ndb.Model):
    id = ndb.IntegerProperty(required=True)
    name = ndb.StringProperty(required=True)


class Recruit(ndb.Model):
    user_id = ndb.IntegerProperty(required=True)
    recruiter_id = ndb.IntegerProperty()
    status = ndb.IntegerProperty()
    notes = ndb.StringProperty(default='')


class Character(ndb.Model):
    id = ndb.IntegerProperty()
    name = ndb.StringProperty()
    corporation_id = ndb.IntegerProperty()
    is_male = ndb.BooleanProperty()
    refreshToken = ndb.StringProperty()
    px64x64 = ndb.StringProperty()
    px128x128 = ndb.StringProperty()
    px256x256 = ndb.StringProperty()
    px512x512 = ndb.StringProperty()

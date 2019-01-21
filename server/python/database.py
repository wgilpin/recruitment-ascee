from google.appengine.ext import ndb


class Recruiter(ndb.Model):
    id = ndb.IntegerProperty()


class Character(ndb.Model):
    id = ndb.IntegerProperty()
    name = ndb.StringProperty()


class User(ndb.Model):
    alts = ndb.ListProperty()

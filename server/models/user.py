from models.database import db
from models.eve import Character
from flask_login import UserMixin


class User(db.Model, UserMixin):
    __tablename__ = 'app_user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    characters = db.relationship('Character', uselist=True, back_populates='user')
    recruiter = db.relationship('Recruiter', uselist=False)
    admin = db.relationship('Admin', uselist=False)
    applications = db.relationship('Application', uselist=True, back_populates='user')
    redlisted = db.Column(db.Boolean, default=False)


    @classmethod
    def get(cls, id):
        user = db.session.query(cls).get(id)
        if user is None:
            character = Character.get(id=id)
            user = cls(id=id, name=character.name)
            db.session.add(user)
            db.session.commit()
            if character.user_id is None:
                character.user_id = user.id
                db.session.commit()
        return user

    def get_id(self):
        return self.id

    @classmethod
    def get_multi(cls, id_list):
        existing_items = db.session.query(cls).filter(
            cls.id.in_(id_list))
        return_items = {item.id: item for item in existing_items}
        missing_ids = set(id_list).difference(
            [item.id for item in existing_items])
        for id in missing_ids:
            return_items[id] = cls.get(id)
        return return_items

    @property
    def is_redlisted(self):
        return self.redlisted


class Recruiter(db.Model):
    __tablename__ = 'recruiter'
    id = db.Column(db.Integer, db.ForeignKey(User.id), primary_key=True)
    user = db.relationship(User)
    applications = db.relationship('Application', uselist=True, back_populates='recruiter')
    is_senior = db.Column(db.Boolean, default=False)


class Admin(db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, db.ForeignKey(User.id), primary_key=True)
    user = db.relationship(User)

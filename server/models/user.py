from models.database import db
from models.eve import Character
from flask_login import UserMixin


class User(db.Model, UserMixin):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100))
    characters = db.relationship('Character', uselist=True, back_populates='user')

    @classmethod
    def get(cls, id):
        user = db.session.query(cls).get(id)
        if user is None:
            character = Character.get(id=id)
            user = User(id=id, name=character.name)
            db.session.add(user)
            db.session.commit()
        return user

    def get_id(self):
        return self.id


class Recruiter(User):
    __tablename__ = 'recruiter'
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), primary_key=True)
    user = db.relationship("User", uselist=False)
    is_senior = db.Column(db.Boolean, default=False)


class Admin(User):
    __tablename__ = 'admin'
    user_id = db.Column(db.Integer, db.ForeignKey(User.id), primary_key=True)
    user = db.relationship("User", uselist=False)

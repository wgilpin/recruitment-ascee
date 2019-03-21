from models.database import db
from models.user import User, Recruiter
from datetime import datetime


class Application(db.Model):
    __tablename__ = 'application'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey(User.id))
    user = db.relationship(User)
    recruiter_id = db.Column(db.Integer, db.ForeignKey(Recruiter.id), nullable=True)
    recruiter = db.relationship(Recruiter)
    is_submitted = db.Column(db.Boolean, default=False)
    is_concluded = db.Column(db.Boolean, default=False)
    is_accepted = db.Column(db.Boolean, default=False)
    is_invited = db.Column(db.Boolean, default=False)
    answers = db.relationship("Answer", uselist=True, back_populates="application")
    notes = db.relationship("Note", uselist=True, back_populates="application")

    @classmethod
    def get_for_user(cls, user_id):
        return db.session.query(cls).filter_by(user_id=user_id, is_concluded=False).first()


class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.Text)


class Answer(db.Model):
    __tablename__ = 'answer'
    question_id = db.Column(db.Integer, db.ForeignKey(Question.id), primary_key=True)
    question = db.relationship("Question", uselist=False)
    application_id = db.Column(db.Integer, db.ForeignKey(Application.id), primary_key=True)
    application = db.relationship("Application", uselist=False, back_populates="answers")
    text = db.Column(db.Text)


class Note(db.Model):
    __tablename__ = 'note'
    id = db.Column(db.Integer, primary_key=True)
    author_id = db.Column(db.Integer)
    text = db.Column(db.Text)
    title = db.Column(db.Text, nullable=True)
    is_chat_log = db.Column(db.Boolean)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    application_id = db.Column(db.Integer, db.ForeignKey(Application.id))
    application = db.relationship("Application", uselist=False, back_populates="notes")

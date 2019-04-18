from models.database import db
from models.user import User, Recruiter
from datetime import datetime
import boto3
from flask_app import app
from esi_config import aws_bucket_name


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
    answers = db.relationship('Answer', uselist=True, back_populates='application')
    notes = db.relationship('Note', uselist=True, back_populates='application')
    images = db.relationship('Image', uselist=True, back_populates='application')

    @classmethod
    def get_for_user(cls, user_id):
        return db.session.query(cls).filter(
            db.and_(
                cls.user_id==user_id,
                db.or_(
                    cls.is_concluded==False,
                    db.and_(
                        cls.is_accepted==True,
                        cls.is_invited==False
                    )
                )
            )
        ).first()

    @classmethod
    def get_submitted_for_user(cls, user_id):
        return db.session.query(cls).filter(
            db.and_(
                cls.user_id==user_id,
                cls.is_submitted==True,
                db.or_(
                    cls.is_concluded==False,
                    db.and_(
                        cls.is_accepted==True,
                        cls.is_invited==False
                    )
                )
            )
        ).first()


class Question(db.Model):
    __tablename__ = 'question'
    id = db.Column(db.Integer, primary_key=True)
    answers = db.relationship('Answer', uselist=True, back_populates='question')
    text = db.Column(db.Text)


class Answer(db.Model):
    __tablename__ = 'answer'
    question_id = db.Column(db.Integer, db.ForeignKey(Question.id), primary_key=True)
    question = db.relationship("Question", uselist=False, back_populates='answers')
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


class Image(db.Model):
    __tablename__ = 'images'
    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey(Application.id))
    application = db.relationship(Application, back_populates='images')
    is_confirmed = db.Column(db.Boolean, default=False, nullable=False)

    @property
    def url(self):
        if not app.config.get('TESTING'):
            conn = boto3.resource('s3')
            bucket = conn.get_bucket(aws_bucket_name)
            key = bucket.get_key(self.filename, validate=False)
            url = key.generate_url(3600)
        else:
            url = 'placeholder url for {}'.format(self.id)
        return url

    @property
    def filename(self):
        return str(self.id)

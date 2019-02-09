import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
print(sys.version)
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

from models import Character, User, Admin, Recruiter, Question, Answer, Application, db, Note, Corporation
import unittest
import warnings


ascee_corp_id = 98589569

def initDbForE2e():

    clearDB()

    # TODO: Id of admin user
    admin_id = 123

    db.session.add(Character(
        id=admin_id,
        user_id=admin_id,
        name='ADMIN NAME',
        corporation_id=ascee_corp_id,
        refresh_token='YOUR TOKEN HERE',
    ))
    db.session.add(Admin(
        id=admin_id,
        user_id=admin_id,
        name='Billy Admin',
    ))

    # TODO: Id of applicant user
    character_id = 234

    db.session.add(Character(
        id=character_id,
        user_id=character_id,
        name='APPLICANT NAME',
        corporation_id=ascee_corp_id,
        corporation=Corporation(id=ascee_corp_id, name='ASCEE'),
        refresh_token='YOUR TOKEN HERE'
    ))
    db.session.add(User(
        id=character_id,
        name='APPLICANT NAME',
    ))

    # TODO: Id of recruiter user
    recruiter_id = 345

    db.session.add(Character(
        id=recruiter_id,
        user_id=recruiter_id,
        name='RECRUITER NAME',
        corporation_id=ascee_corp_id,
        refresh_token='YOUR TOKEN HERE'
    ))
    db.session.add(Recruiter(
        id=recruiter_id,
        name='RECRUITER NAME',
    ))

    db.session.add(Question(text='How long have you been playing Eve?'))
    db.session.add(Question(text='PVP or PVE? Why?'))
    db.session.commit()

def clearDB():
    db.session.rollback()
    for model in Character, User, Recruiter, Admin, Application, Question, Answer, Note:
        db.session.query(model).delete()
    db.session.commit()

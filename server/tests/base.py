import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
print(sys.version)
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

#from vcr_unittest import VCRTestCase
import unittest
from models import (
    Character, User, Admin, Recruiter, Question, Answer, Application, db, Note,
)
import warnings
import time


class AsceeTestCase(unittest.TestCase):#VCRTestCase):

    ascee_corp_id = 98589569

    slow_time = 0.3

    def _get_vcr_kwargs(self, **kwargs):
        kwargs.update({
            'record_mode': 'new_episodes'
        })
        return kwargs

    def setUp(self):
        super(AsceeTestCase, self).setUp()
        self.initDB()
        warnings.simplefilter("ignore", ResourceWarning)
        warnings.simplefilter("ignore", UserWarning)
        self._started_at = time.time()

    def tearDown(self):
        elapsed = time.time() - self._started_at
        if elapsed > self.slow_time:
            print(f'\n{self.id()} ({round(elapsed, 2)}s)')
        super(AsceeTestCase, self).tearDown()
        self.clearDB()

    def initDB(self):
        self.clearDB()
        admin_character = Character(
            id=1000,
            user_id=1000,
            name='Admin Alice',
            corporation_id=self.ascee_corp_id,
        )
        db.session.add(admin_character)
        self.admin = Admin(
            id=1000,
            name='Admin Alice',
        )
        db.session.add(self.admin)

        senior_recruiter_character = Character(
            id=1001,
            user_id=1001,
            name='Senior Sam',
            corporation_id=self.ascee_corp_id,
        )
        db.session.add(senior_recruiter_character)
        self.senior_recruiter = Recruiter(
            id=1001,
            is_senior=True,
            name='Senior Sam',
        )
        db.session.add(self.senior_recruiter)

        recruiter_character = Character(
            id=1002,
            user_id=1002,
            name='Recruiter Randy',
            corporation_id=self.ascee_corp_id,
        )
        db.session.add(recruiter_character)
        self.recruiter = Recruiter(
            id=1002,
            name='Recruiter Randy',
        )
        db.session.add(self.recruiter)

        other_recruiter_character = Character(
            id=1003,
            user_id=1003,
            name='OtherRecruiter Oswald',
            corporation_id=self.ascee_corp_id,
        )
        db.session.add(other_recruiter_character)
        self.other_recruiter = Recruiter(
            id=1003,
            name='OtherRecruiter Oswald',
        )
        db.session.add(self.other_recruiter)

        test_applicant_id = 2114496483
        self.applicant_character = Character.get(
            test_applicant_id,
        )
        self.applicant_character.refresh_token = 'rrexor5etNE5-o1BHAKNp8dDZZuLgVqVh7_CQjoU1nInnLOgLUlla8-1kudP2CnLMi4RI6mGADSRdtkHHKRZ935LXdiIhtlOJtpNwik5gRrAXVivVfQek9ZqRdYR5fwoZVflLPIqkCMMG2Yr7XfBbVGUkheAV3tXmYuaXYEHLiZ1ZdG8cOxjY5SDFVQfAz4RlgI7JasjNLhzNuSlPij9S-S2-_7AdwD95PCJeKtRqNte80ztXGJ4IqlOwSWarvmVkNxBJdPfMwy-8KCcTY_FrKSbpWSnXevV0R5Xs2gsXjUEUxv_RIfDwcvz0Ao-IdSes0cpgSDmzs-kpoJQ0y-V2_3JFC9WywXyk80WeKGFkRxspdXKsOnDHXl7GYMPNDSJngWltcpUmcQCMA25DrGCRQ2'
        db.session.add(self.applicant_character)

        self.applicant = User.get(id=test_applicant_id)
        db.session.add(self.applicant)

        test_not_applicant_id = 2112166943
        self.not_applicant_character = Character.get(
            test_not_applicant_id,
        )
        db.session.add(self.not_applicant_character)

        self.not_applicant = User.get(id=test_not_applicant_id)
        db.session.add(self.not_applicant)

        self.application = Application(
            user_id=self.applicant.id,
            recruiter_id=self.recruiter.id,
        )
        db.session.add(self.application)

        self.redlisted_character_1 = Character(
            id=1234,
            user_id=1234,
            name='Redlisted Robert',
            corporation_id=self.ascee_corp_id,
            redlisted=True,
        )
        self.redlisted_character_2 = Character(
            id=4321,
            user_id=4321,
            name='Redlisted Rebecca',
            corporation_id=self.ascee_corp_id,
            redlisted=True,
        )
        db.session.add(self.redlisted_character_1)
        db.session.add(self.redlisted_character_2)
        db.session.commit()

    def clearDB(self):
        db.session.rollback()
        for model in \
            Character, User, Recruiter, Admin, Application, Question, Answer, Note:
            db.session.query(model).delete()
        db.session.commit()

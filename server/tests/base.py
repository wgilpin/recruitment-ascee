import sys
import os
from config import server_dir
print(sys.version)
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

from vcr_unittest import VCRTestCase
import unittest
from anom.testing import Emulator
from recruitment import get_questions, get_answers
from database import Character, User, Key, Question, Answer
import json
from admin import get_users


class AsceeTestCase(VCRTestCase):

    ascee_corp_id = 98589569


    def setUp(self):
        self.emulator = Emulator()
        self.emulator.start(inject=True)
        self.initDB()

    def tearDown(self):
        self.clearDB()
        self.emulator.stop()

    def initDB(self):
        self.clearDB()
        admin_character = Character(
            key=Key(Character, 1000),
            user_id=1000,
            name='Admin Alice',
            is_male=False,
            corporation_id=self.ascee_corp_id,
        )
        admin_character.put()
        self.admin = User(
            key=Key(User, 1000),
            is_admin=True,
        )
        self.admin.put()

        senior_recruiter_character = Character(
            key=Key(Character, 1001),
            user_id=1001,
            name='Senior Sam',
            is_male=True,
            corporation_id=self.ascee_corp_id,
        )
        senior_recruiter_character.put()
        self.senior_recruiter = User(
            key=Key(User, 1001),
            is_senior_recruiter=True,
        )
        self.senior_recruiter.put()

        recruiter_character = Character(
            key=Key(Character, 1002),
            user_id=1002,
            name='Recruiter Randy',
            is_male=True,
            corporation_id=self.ascee_corp_id,
        )
        recruiter_character.put()
        self.recruiter = User(
            key=Key(User, 1002),
            is_recruiter=True,
        )
        self.recruiter.put()

        self.recruiter.put()
        test_applicant_id = 2114496483
        self.applicant = User.get(id=test_applicant_id)
        self.applicant.recruiter_id = self.recruiter.get_id()
        self.applicant.put()
        applicant_character = Character.get(
            test_applicant_id,
        )
        applicant_character.refresh_token = 'rrexor5etNE5-o1BHAKNp8dDZZuLgVqVh7_CQjoU1nInnLOgLUlla8-1kudP2CnLMi4RI6mGADSRdtkHHKRZ935LXdiIhtlOJtpNwik5gRrAXVivVfQek9ZqRdYR5fwoZVflLPIqkCMMG2Yr7XfBbVGUkheAV3tXmYuaXYEHLiZ1ZdG8cOxjY5SDFVQfAz4RlgI7JasjNLhzNuSlPij9S-S2-_7AdwD95PCJeKtRqNte80ztXGJ4IqlOwSWarvmVkNxBJdPfMwy-8KCcTY_FrKSbpWSnXevV0R5Xs2gsXjUEUxv_RIfDwcvz0Ao-IdSes0cpgSDmzs-kpoJQ0y-V2_3JFC9WywXyk80WeKGFkRxspdXKsOnDHXl7GYMPNDSJngWltcpUmcQCMA25DrGCRQ2'
        applicant_character.put()

    def clearDB(self):
        for model in Character, User:
            for item in model.query().run():
                item.delete()

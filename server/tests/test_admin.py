import sys
import os
from config import server_dir
print(sys.version)
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from recruitment import get_questions, get_answers
from database import Character, User, Key, Question, Answer
from admin import get_users
from base import AsceeTestCase


class GetUsersTests(AsceeTestCase):

    def test_get_users(self):
        response = get_users()
        assert 'info' in response
        data = response['info']
        assert len(data) == 3
        for user in data:
            self.assertTrue(isinstance(user['id'], int))
            self.assertTrue(isinstance(user['name'], str))
            self.assertTrue(isinstance(user['is_admin'], bool))
            self.assertTrue(isinstance(user['is_recruiter'], bool))
            self.assertTrue(isinstance(user['is_senior_recruiter'], bool))
            assert len(user) == 5


if __name__ == '__main__':
    unittest.main()

import sys
import os
from config import server_dir
print(sys.version)
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from recruitment import get_questions, get_answers
from models import Character, User, Question, Answer, db
from base import AsceeTestCase
from flask_app import app


class QuestionAnswerTests(AsceeTestCase):

    def test_no_questions(self):
        result = get_questions()
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 0)

    def test_one_question(self):
        question = Question(text='Question 1?')
        db.session.add(question)
        db.session.commit()
        result = get_questions()
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 1)
        self.assertEquals(list(result.values())[0].text, 'Question 1?')

    def test_multiple_questions(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_questions()
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 3)

    def test_no_questions_answers(self):
        result = get_answers(self.applicant.get_id())
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 0)

    def test_three_questions_no_answers(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_answers(self.applicant.get_id())
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 0)
        for question_id, answer_data in result.items():
            self.assertIsInstance(question_id, int)
            self.assertIsInstance(answer_data['question'], str)
            self.assertEquals(answer_data['user_id'], self.applicant.get_id())
            self.assertIsInstance(answer_data['answer'], str)
            self.assertEquals(answer_data['answer'], '')
            self.assertEquals(len(answer_data), 4)

    def test_three_questions_one_answer(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        answer = Answer(
            question_id=question.get_id(),
            text='My answer.'
        )
        result = get_answers(self.applicant.get_id())
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 0)
        for question_id, answer_data in result.items():
            self.assertIsInstance(question_id, int)
            self.assertIsInstance(answer_data['question'], str)
            self.assertIsInstance(answer_data['answer'], str)
            self.assertEquals(answer_data['user_id'], self.applicant.get_id())
            self.assertEquals(len(answer_data), 4)
            if question_id != answer.question_id:
                self.assertEquals(answer_data['answer'], '')
        assert result[answer.question_id]['answer'] == 'My answer.'


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

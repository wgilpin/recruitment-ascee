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
        self.assertEquals(len(result), 0, result)

    def test_one_question(self):
        question = Question(text='Question 1?')
        db.session.add(question)
        db.session.commit()
        result = get_questions()
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 1)
        self.assertEqual(list(result.values())[0], 'Question 1?')

    def test_multiple_questions(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_questions()
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 3)

    def test_no_questions_answers(self):
        result = get_answers(self.applicant.id)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 0)

    def test_three_questions_no_answers(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_answers(self.applicant.id)
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 3)
        for question_id, answer_data in result.items():
            self.assertIsInstance(question_id, int)
            self.assertIsInstance(answer_data['question'], str)
            self.assertEqual(answer_data['user_id'], self.applicant.id)
            self.assertIsInstance(answer_data['answer'], str)
            self.assertEqual(answer_data['answer'], '')
            self.assertEqual(len(answer_data), 3, answer_data)

    def test_three_questions_one_answer(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        answer = Answer(
            question_id=question.id,
            text='My answer.',
            application_id=self.application.id,
        )
        db.session.add(answer)
        db.session.commit()
        result = get_answers(self.applicant.id)
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 3)
        for question_id, answer_data in result.items():
            self.assertIsInstance(question_id, int)
            self.assertIsInstance(answer_data['question'], str)
            self.assertIsInstance(answer_data['answer'], str)
            self.assertEqual(answer_data['user_id'], self.applicant.id)
            self.assertEqual(len(answer_data), 3, answer_data)
            if question_id != answer.question_id:
                self.assertEqual(answer_data['answer'], '', answer)
        self.assertEqual(result[answer.question_id]['answer'], 'My answer.')

    def test_three_questions_three_answers(self):
        for i in range(3):
            question = Question(text='{}?'.format(i))
            db.session.add(question)
            db.session.commit()
            answer = Answer(
                question_id=question.id,
                text='{}.'.format(i),
                application_id=self.application.id,
            )
            db.session.add(answer)
            db.session.commit()
        result = get_answers(self.applicant.id)
        self.assertIsInstance(result, dict)
        self.assertEquals(len(result), 3)
        for question_id, answer_data in result.items():
            self.assertIsInstance(question_id, int)
            self.assertIsInstance(answer_data['question'], str)
            self.assertIsInstance(answer_data['answer'], str)
            self.assertEqual(answer_data['user_id'], self.applicant.id)
            self.assertEqual(len(answer_data), 3, answer_data)
            self.assertEqual(answer_data['answer'], answer_data['question'][:1] + '.')


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

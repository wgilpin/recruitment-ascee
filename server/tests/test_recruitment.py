import sys
import os
from config import server_dir
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from recruitment import (
    get_questions, get_answers, get_user_characters, get_users, get_user_application,\
    edit_applicant_notes)
from models import Character, User, Question, Answer, Application, db
from base import AsceeTestCase
from flask_app import app
from exceptions import BadRequestException, ForbiddenException
import asyncio


class QuestionAnswerTests(AsceeTestCase):

    def test_no_questions(self):
        result = get_questions()
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 0, result)

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

    def test_multiple_questions_as_applicant(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_questions(current_user=self.applicant)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 3)

    def test_multiple_questions_as_recruiter(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_questions(current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 3)

    def test_multiple_questions_as_admin(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_questions(current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 3)

    def test_no_questions_answers(self):
        result = get_answers(self.applicant.id, current_user=self.recruiter.user)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 0)

    def test_question_answer(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.', application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        result = get_answers(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[question.id]['answer'], 'Answer.')
        self.assertEqual(result[question.id]['question'], 'Question?')
        self.assertEqual(result[question.id]['user_id'], self.applicant.id)

    def test_three_questions_no_answers(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_answers(self.applicant.id, current_user=self.recruiter.user)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 3)
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
        result = get_answers(self.applicant.id, current_user=self.recruiter.user)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 3)
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
        result = get_answers(self.applicant.id, current_user=self.recruiter.user)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 3)
        for question_id, answer_data in result.items():
            self.assertIsInstance(question_id, int)
            self.assertIsInstance(answer_data['question'], str)
            self.assertIsInstance(answer_data['answer'], str)
            self.assertEqual(answer_data['user_id'], self.applicant.id)
            self.assertEqual(len(answer_data), 3, answer_data)
            self.assertEqual(answer_data['answer'], answer_data['question'][:1] + '.')

    def test_question_answer_as_applicant(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.', application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        result = get_answers(self.applicant.id, current_user=self.applicant)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[question.id]['answer'], 'Answer.')
        self.assertEqual(result[question.id]['question'], 'Question?')
        self.assertEqual(result[question.id]['user_id'], self.applicant.id)

    def test_question_answer_as_other_recruiter(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.', application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        with self.assertRaises(ForbiddenException):
            get_answers(self.applicant.id, current_user=self.other_recruiter.user)

    def test_question_answer_as_senior_recruiter(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.',
                        application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        result = get_answers(self.applicant.id, current_user=self.senior_recruiter.user)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[question.id]['answer'], 'Answer.')
        self.assertEqual(result[question.id]['question'], 'Question?')
        self.assertEqual(result[question.id]['user_id'], self.applicant.id)

    def test_question_answer_as_admin(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.', application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        with self.assertRaises(ForbiddenException):
            get_answers(self.applicant.id, current_user=self.admin.user)


class MiscRecruitmentTests(AsceeTestCase):

    def test_get_user_application(self):
        response = get_user_application(self.applicant.id)
        self.assertEqual(response.user_id, self.applicant.id)

    def test_edit_applicant_notes(self):
        response = edit_applicant_notes(self.applicant.id, "A note", current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        response = edit_applicant_notes(self.not_applicant.id, "A note", current_user=self.recruiter)
        self.assertIn('error', response)


    def test_get_users_as_admin(self):
        response = get_users(current_user=self.admin)
        assert 'info' in response
        data = response['info']
        self.assertEqual(len(data), 6, data)
        for user in data:
            self.assertTrue(isinstance(user['id'], int))
            self.assertTrue(isinstance(user['name'], str))
            self.assertTrue(isinstance(user['is_admin'], bool))
            self.assertTrue(isinstance(user['is_recruiter'], bool))
            self.assertTrue(isinstance(user['is_senior_recruiter'], bool))
            assert len(user) == 5
            if user['id'] == self.recruiter.id:
                self.assertEqual(user['is_admin'], False, user)
                self.assertEqual(user['is_recruiter'], True, user)
                self.assertEqual(user['is_senior_recruiter'], False, user)
                self.assertEqual(user['name'], self.recruiter.user.character.name, user)
            elif user['id'] == self.admin.id:
                self.assertEqual(user['is_admin'], True, user)
                self.assertEqual(user['is_recruiter'], False, user)
                self.assertEqual(user['is_senior_recruiter'], False, user)
                self.assertEqual(user['name'], self.admin.user.character.name, user)
            elif user['id'] == self.senior_recruiter.id:
                self.assertEqual(user['is_admin'], False, user)
                self.assertEqual(user['is_recruiter'], True, user)
                self.assertEqual(user['is_senior_recruiter'], True, user)
                self.assertEqual(user['name'], self.senior_recruiter.user.character.name, user)
            elif user['id'] == self.applicant.id:
                self.assertEqual(user['is_admin'], False, user)
                self.assertEqual(user['is_recruiter'], False, user)
                self.assertEqual(user['is_senior_recruiter'], False, user)
                self.assertEqual(user['name'], self.applicant.character.name, user)
            elif user['id'] == self.not_applicant.id:
                self.assertEqual(user['is_admin'], False, user)
                self.assertEqual(user['is_recruiter'], False, user)
                self.assertEqual(user['is_senior_recruiter'], False, user)
                self.assertEqual(user['name'], self.not_applicant.character.name, user)

    def test_get_users_as_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_users(current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_users(current_user=self.other_recruiter)

    def test_get_users_as_senior_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_users(current_user=self.senior_recruiter)

    def test_get_users_as_applicant(self):
        with self.assertRaises(ForbiddenException):
            get_users(current_user=self.applicant)

    def test_user_character_list_as_recruiter(self):
        result = get_user_characters(self.applicant.id, current_user=self.recruiter.user)
        self.assertTrue('info' in result)
        character_dict = result['info']
        self.assertEqual(len(character_dict), 1)
        self.assertTrue(self.applicant.id in character_dict)
        character = character_dict[self.applicant.id]
        for property in ('name', 'corporation_name'):
            self.assertTrue(property in character.keys(), property)

    def test_user_character_list_as_senior_recruiter(self):
        result = get_user_characters(self.applicant.id, current_user=self.senior_recruiter.user)
        self.assertTrue('info' in result)
        character_dict = result['info']
        self.assertEqual(len(character_dict), 1)
        self.assertTrue(self.applicant.id in character_dict)
        character = character_dict[self.applicant.id]
        for property in ('name', 'corporation_name'):
            self.assertTrue(property in character.keys(), property)

    def test_user_character_list_as_admin(self):
        with self.assertRaises(ForbiddenException):
            get_user_characters(self.applicant.id, current_user=self.admin.user)

    def test_user_character_list_as_other_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_user_characters(self.applicant.id, current_user=self.other_recruiter.user)

    def test_user_character_list_as_applicant(self):
        result = get_user_characters(self.applicant.id, current_user=self.applicant)
        self.assertTrue('info' in result)
        character_dict = result['info']
        self.assertEqual(len(character_dict), 1)
        self.assertTrue(self.applicant.id in character_dict)
        character = character_dict[self.applicant.id]
        for property in ('name', 'corporation_name'):
            self.assertTrue(property in character.keys(), property)

    def test_user_character_list_for_invalid_user(self):
        with self.assertRaises(BadRequestException):
            get_user_characters(1234845, current_user=self.senior_recruiter.user)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

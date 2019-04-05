import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from recruitment import (
    get_questions, get_answers, get_user_characters, get_users,
    add_applicant_note, get_character_search_list, get_applicant_list, set_answers,
    set_questions, remove_question, get_applicant_notes,
    application_history, get_user_corporations,
)
from status import reject_applicant, accept_applicant, invite_applicant, \
    claim_applicant, submit_application, start_application
from models import Character, User, Question, Answer, Application, db
from base import AsceeTestCase
from flask_app import app
from exceptions import BadRequestException, ForbiddenException


class AddRemoveQuestionsTests(AsceeTestCase):

    def test_add_question_forbidden(self):
        for user in (self.recruiter, self.senior_recruiter, self.applicant, self.not_applicant):
            with self.assertRaises(ForbiddenException):
                set_questions([{'text': 'Question?'}], current_user=user)

    def test_remove_question_forbidden(self):
        question = Question(text='Question 1?')
        db.session.add(question)
        db.session.commit()
        for user in (self.recruiter, self.senior_recruiter, self.applicant, self.not_applicant):
            with self.assertRaises(ForbiddenException):
                remove_question(question.id, current_user=user)

    def test_add_question(self):
        response = set_questions([{'text': 'Question?'}], current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        questions = db.session.query(Question)
        self.assertEqual(questions.count(), 1)
        question = questions.one()
        self.assertEqual(question.text, 'Question?')

    def test_add_two_questions_at_once(self):
        response = set_questions([{'text': 'Question?'}, {'text': 'Another Question?'}], current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        questions = db.session.query(Question)
        self.assertEqual(questions.count(), 2)
        self.assertEqual(db.session.query(Question).filter_by(text='Question?').count(), 1)
        self.assertEqual(db.session.query(Question).filter_by(text='Another Question?').count(), 1)

    def test_add_two_questions_in_series(self):
        response = set_questions(
            [{'text': 'Question?'}],
            current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        self.assertEqual(db.session.query(Question).count(), 1)
        self.assertEqual(
            db.session.query(Question).filter_by(text='Question?').count(),
            1)
        response = set_questions(
            [{'text': 'Another Question?'}],
            current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        questions = db.session.query(Question)
        self.assertEqual(questions.count(), 2)
        self.assertEqual(
            db.session.query(Question).filter_by(text='Question?').count(),
            1)
        self.assertEqual(db.session.query(Question).filter_by(
            text='Another Question?').count(), 1)

    def test_update_question(self):
        response = set_questions([{'text': 'Question?'}], current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        question = db.session.query(Question).one()
        response = set_questions([{'question_id': question.id, 'text': 'A Question?'}], current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        questions = db.session.query(Question)
        self.assertEqual(questions.count(), 1)
        question = questions.one()
        self.assertEqual(question.text, 'A Question?')

    def test_remove_only_question(self):
        response = set_questions([{'text': 'Question?'}], current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        questions = get_questions(current_user=self.admin)
        self.assertEqual(len(questions), 1)
        for question_id, text in questions.items():
            response = remove_question(question_id, current_user=self.admin)
            self.assertEqual(response, {'status': 'ok'})
        questions = get_questions(current_user=self.admin)
        self.assertEqual(len(questions), 0)

    def test_remove_one_question(self):
        response = set_questions([{'text': 'Question?'}, {'text': 'Another Question?'}], current_user=self.admin)
        self.assertEqual(response, {'status': 'ok'})
        questions = get_questions(current_user=self.admin)
        self.assertEqual(len(questions), 2)
        for question_id, text in questions.items():
            if text == 'Question?':
                break
        remove_question(question_id, current_user=self.admin)
        questions = get_questions(current_user=self.admin)
        self.assertEqual(len(questions), 1)
        self.assertEqual(list(questions.values())[0], 'Another Question?')


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

    def test_has_application(self):
        result = get_answers(self.applicant.id)
        self.assertIsInstance(result, dict)
        self.assertIn('has_application', result)
        self.assertEqual(result['has_application'], True)

    def test_has_no_application(self):
        with self.assertRaises(BadRequestException):
            get_answers(self.not_applicant.id)

    def test_no_questions_answers(self):
        result = get_answers(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertIn('questions', result)
        self.assertEqual(len(result['questions']), 0)

    def test_question_answer(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.', application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        result = get_answers(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertIn('questions', result)
        self.assertEqual(len(result['questions']), 1)
        self.assertEqual(result['questions'][question.id]['answer'], 'Answer.')
        self.assertEqual(result['questions'][question.id]['question'], 'Question?')
        self.assertEqual(result['questions'][question.id]['user_id'], self.applicant.id)

    def test_three_questions_no_answers(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_answers(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertIn('questions', result)
        self.assertEqual(len(result['questions']), 3)
        for question_id, answer_data in result['questions'].items():
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
        result = get_answers(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result['questions']), 3)
        for question_id, answer_data in result['questions'].items():
            self.assertIsInstance(question_id, int)
            self.assertIsInstance(answer_data['question'], str)
            self.assertIsInstance(answer_data['answer'], str)
            self.assertEqual(answer_data['user_id'], self.applicant.id)
            self.assertEqual(len(answer_data), 3, answer_data)
            if question_id != answer.question_id:
                self.assertEqual(answer_data['answer'], '', answer)
        self.assertEqual(result['questions'][answer.question_id]['answer'], 'My answer.')

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
        result = get_answers(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result['questions']), 3)
        for question_id, answer_data in result['questions'].items():
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
        self.assertEqual(len(result['questions']), 1)
        self.assertEqual(result['questions'][question.id]['answer'], 'Answer.')
        self.assertEqual(result['questions'][question.id]['question'], 'Question?')
        self.assertEqual(result['questions'][question.id]['user_id'], self.applicant.id)

    def test_question_answer_as_other_recruiter(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.', application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        with self.assertRaises(ForbiddenException):
            get_answers(self.applicant.id, current_user=self.other_recruiter)

    def test_question_answer_as_senior_recruiter(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.',
                        application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        result = get_answers(self.applicant.id, current_user=self.senior_recruiter)
        self.assertIsInstance(result, dict)
        self.assertEqual(len(result['questions']), 1)
        self.assertEqual(result['questions'][question.id]['answer'], 'Answer.')
        self.assertEqual(result['questions'][question.id]['question'], 'Question?')
        self.assertEqual(result['questions'][question.id]['user_id'], self.applicant.id)

    def test_question_answer_as_admin(self):
        question = Question(text='Question?')
        db.session.add(question)
        db.session.commit()
        answer = Answer(question_id=question.id, text='Answer.', application_id=self.application.id)
        db.session.add(answer)
        db.session.commit()
        with self.assertRaises(ForbiddenException):
            get_answers(self.applicant.id, current_user=self.admin)

    def test_set_answers_applicant_with_application_applicant(self):
        for i in range(3):
            question = Question(text='Question {}?'.format(i))
            db.session.add(question)
            db.session.commit()
        result = get_questions(current_user=self.applicant)
        question_keys = []
        answers = []
        for k in result:
            question_keys.append(k)
            answers.append({'question_id': k, 'text': f'answer for {k}'})
        set_answers(self.applicant.id, answers=answers, current_user=self.applicant)
        db.session.commit()
        after_set_result = get_answers(self.applicant.id, current_user=self.applicant)
        self.assertIsInstance(after_set_result, dict)
        self.assertEqual(len(after_set_result['questions']), 3)
        for k in question_keys:
            self.assertEqual(after_set_result['questions'][k]['answer'], f'answer for {k}')

    def test_set_answers_applicant_with_application_non_applicant(self):
        answers = [{'question_id': 1, 'text': f'answer for 1'}]
        with self.assertRaises(ForbiddenException):
            set_answers(self.applicant.id, answers=answers, current_user=self.admin)
        with self.assertRaises(ForbiddenException):
            set_answers(self.applicant.id, answers=answers, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            set_answers(self.applicant.id, answers=answers, current_user=self.senior_recruiter)

    def test_set_answers_non_applicant_with_application(self):
        answers = [{'question_id': 1, 'text': f'answer for 1'}]
        with self.assertRaises(ForbiddenException):
            set_answers(self.recruiter.id, answers=answers, current_user=self.applicant)
        with self.assertRaises(ForbiddenException):
            set_answers(self.recruiter.id, answers=answers, current_user=self.admin)
        with self.assertRaises(ForbiddenException):
            set_answers(self.recruiter.id, answers=answers, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            set_answers(self.admin.id, answers=answers, current_user=self.admin)
        with self.assertRaises(ForbiddenException):
            set_answers(self.senior_recruiter.id, answers=answers, current_user=self.recruiter)


class MiscRecruitmentTests(AsceeTestCase):

    def test_start_application(self):
        application = Application.get_for_user(self.not_applicant.id)
        self.assertIsNone(application, None)
        start_application(self.not_applicant)
        application = Application.get_for_user(self.not_applicant.id)
        self.assertIsInstance(application, Application)
        self.assertEqual(application.user_id, self.not_applicant.id)

    def test_start_application_second_time(self):
        with self.assertRaises(BadRequestException):
            start_application(self.applicant)

    def test_start_application_with_roles(self):
        with self.assertRaises(BadRequestException):
            start_application(self.admin)
        with self.assertRaises(BadRequestException):
            start_application(self.recruiter)
        with self.assertRaises(BadRequestException):
            start_application(self.senior_recruiter)

    def test_start_new_application_after_rejection(self):
        reject_applicant(self.applicant.id, self.recruiter)
        start_application(self.applicant)
        application = Application.get_for_user(self.applicant.id)
        self.assertIsInstance(application, Application)
        self.assertEqual(application.user_id, self.applicant.id)

    # Applicant list tests

    def test_get_applicant_list_as_recruiter(self):
        response = get_applicant_list(current_user=self.recruiter)
        self.applicant_list_helper(response)

    def applicant_list_helper(self, response):
        self.assertIn('info', response)
        self.assertEqual(len(response['info']), 1)
        self.assertIn(self.applicant.id, response['info'])
        record = response['info'][self.applicant.id]
        self.assertEqual(record['user_id'], self.applicant.id)
        self.assertEqual(record['recruiter_id'], self.recruiter.id)
        self.assertEqual(record['recruiter_name'], self.recruiter.name)
        self.assertEqual(record['name'], self.applicant.name)
        self.assertTrue(record['status'] in ['claimed', 'new', 'accepted'])

    def test_get_applicant_list_as_admin(self):
        response = get_applicant_list(current_user=self.admin)
        self.applicant_list_helper(response)

    def test_get_applicant_list_as_snr_recruiter(self):
        response = get_applicant_list(current_user=self.admin)
        self.applicant_list_helper(response)

    def test_get_applicant_list_as_applicant(self):
        with self.assertRaises(ForbiddenException):
            get_applicant_list(current_user=self.applicant)

    # end of applicant list

    def test_get_user_application(self):
        result = Application.get_for_user(self.applicant.id)
        self.assertEqual(result.user_id, self.applicant.id)
        self.assertEqual(result, self.application)

    def test_get_user_application_on_non_applicant(self):
        result = Application.get_for_user(self.not_applicant.id)
        self.assertEqual(result, None)

    def test_add_applicant_note(self):
        response = add_applicant_note(self.applicant.id, "A note", current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        notes = self.application.notes
        self.assertEqual(len(notes), 1)
        self.assertEqual(notes[0].text, "A note")
        self.assertEqual(notes[0].title, None)
        response = add_applicant_note(self.applicant.id, "Another note", current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        notes = self.application.notes
        self.assertEqual(len(notes), 2)

    def test_add_applicant_note_on_accepted(self):
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        notes = self.application.notes
        self.assertEqual(len(notes), 1)
        response = add_applicant_note(self.applicant.id, "A note", current_user=self.senior_recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        notes = self.application.notes
        self.assertEqual(len(notes), 2)
        self.assertEqual(notes[1].text, "A note")
        self.assertEqual(notes[1].title, None)

    def test_add_chat_log_with_title(self):
        response = add_applicant_note(self.applicant.id, "A note", title="A Title", is_chat_log=True, current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        notes = self.application.notes
        self.assertEqual(len(notes), 1)
        self.assertEqual(notes[0].text, "A note")
        self.assertEqual(notes[0].title, "A Title")
        response = add_applicant_note(self.applicant.id, "Another note", current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        notes = self.application.notes
        self.assertEqual(len(notes), 2)

    def test_get_chat_log_with_title(self):
        add_applicant_note(self.applicant.id, "A note", title="A Title", is_chat_log=True, current_user=self.recruiter)
        response = get_applicant_notes(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(response, dict)
        self.assertIn('info', response)
        self.assertEqual(len(response['info']), 1)
        data = response['info'][0]
        for key in ('timestamp', 'author', 'title', 'text', 'id', 'is_chat_log'):
            self.assertIn(key, data)
        self.assertEqual(data['title'], 'A Title')
        self.assertEqual(data['text'], 'A note')
        self.assertEqual(data['is_chat_log'], True)

    def test_get_applicant_notes_without_title(self):
        add_applicant_note(self.applicant.id, "A note", current_user=self.recruiter)
        response = get_applicant_notes(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(response, dict)
        self.assertIn('info', response)
        self.assertEqual(len(response['info']), 1)
        data = response['info'][0]
        for key in ('timestamp', 'author', 'title', 'text', 'id', 'is_chat_log'):
            self.assertIn(key, data)
        self.assertEqual(data['title'], None)
        self.assertEqual(data['text'], 'A note')
        self.assertEqual(data['is_chat_log'], False)

    def test_get_applicant_notes_forbidden(self):
        add_applicant_note(self.applicant.id, "A note", current_user=self.recruiter)
        for user in (self.other_recruiter, self.not_applicant):
            with self.assertRaises(ForbiddenException):
                get_applicant_notes(self.applicant.id, current_user=user)

    def test_add_applicant_note_as_senior_recruiter(self):
        response = add_applicant_note(self.applicant.id, "A note", current_user=self.recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        notes = self.application.notes
        self.assertEqual(len(notes), 1)
        self.assertEqual(notes[0].text, "A note")
        response = add_applicant_note(self.applicant.id, "Another note", current_user=self.senior_recruiter)
        self.assertDictEqual(response, {'status': 'ok'})
        notes = self.application.notes
        self.assertEqual(len(notes), 2)

    def test_add_applicant_note_as_other_recruiter(self):
        with self.assertRaises(ForbiddenException):
            add_applicant_note(
                self.applicant.id, "A note", current_user=self.other_recruiter
            )

    def test_add_applicant_note_as_admin(self):
        with self.assertRaises(ForbiddenException):
            add_applicant_note(
                self.applicant.id, "A note", current_user=self.admin
            )

    def test_add_applicant_note_as_applicant(self):
        with self.assertRaises(ForbiddenException):
            add_applicant_note(
                self.applicant.id, "A note", current_user=self.applicant
            )

    def test_add_applicant_note_non_recruiter(self):
        with self.assertRaises(ForbiddenException):
            add_applicant_note(
                self.applicant.id, "A note", current_user=self.not_applicant
            )

    def test_add_not_an_applicant_note(self):
        with self.assertRaises(BadRequestException):
            add_applicant_note(
                self.not_applicant.id,
                "A note",
                current_user=self.recruiter
            )

    def test_add_not_an_applicant_note_as_senior_recruiter(self):
        with self.assertRaises(BadRequestException):
            add_applicant_note(
                self.not_applicant.id,
                "A note",
                current_user=self.senior_recruiter
            )

    def test_get_character_search_list_invalid(self):
        with self.assertRaises(ForbiddenException):
            get_character_search_list('Kovacs', self.not_applicant)

    def test_get_character_search_list(self):
        response = get_character_search_list('Kovacs', self.recruiter)
        self.assertIn(self.not_applicant.id, response)
        self.assertEqual(response[self.not_applicant.id]['name'], self.not_applicant.name)

    def test_get_character_search_empty(self):
        response = get_character_search_list('', self.recruiter)
        self.assertEqual(len(response), 0)

    def test_get_character_search_long(self):
        response = get_character_search_list('dslkjdh aiudhaso iduhas liduhas lidu gasoidug '+\
            'asdliudfg asiduyg alsiudg alsidughas liduha liduh asliduhas liduh asliduhas ilduhas '+\
            'asdliudfg asiduyg alsiudg alsidughas liduha liduh asliduhas liduh asliduhas ilduhas '+\
            'asdliudfg asiduyg alsiudg alsidughas liduha liduh asliduhas liduh asliduhas ilduhas '+\
            'asdliudfg asiduyg alsiudg alsidughas liduha liduh asliduhas liduh asliduhas ilduhas '+\
            'asdliudfg asiduyg alsiudg alsidughas liduha liduh asliduhas liduh asliduhas ilduhas '+\
            'asdliudfg asiduyg alsiudg alsidughas liduha liduh asliduhas liduh asliduhas ilduhas '+\
                'liduhas liudh laisudha lisudh  iuyg iuytf dutrd cjuygfOIUYT FIYTf iuky',
            self.recruiter)
        self.assertEqual(len(response), 0)

    def test_get_character_search_unicode(self):
        response = get_character_search_list('\u0495\u7463\u0004', self.recruiter)
        self.assertEqual(len(response), 0)

    def test_get_users_as_admin(self):
        response = get_users(current_user=self.admin)
        assert 'info' in response
        data = response['info']
        self.assertEqual(len(data), 4, data)
        for user in data:
            self.assertIsInstance(user['id'], int)
            self.assertIsInstance(user['name'], str)
            self.assertIsInstance(user['is_admin'], bool)
            self.assertIsInstance(user['is_recruiter'], bool)
            self.assertIsInstance(user['is_senior_recruiter'], bool)
            assert len(user) == 5
            if user['id'] == self.recruiter.id:
                self.assertEqual(user['is_admin'], False, user)
                self.assertEqual(user['is_recruiter'], True, user)
                self.assertEqual(user['is_senior_recruiter'], False, user)
                self.assertEqual(user['name'], self.recruiter.name, user)
            elif user['id'] == self.admin.id:
                self.assertEqual(user['is_admin'], True, user)
                self.assertEqual(user['is_recruiter'], False, user)
                self.assertEqual(user['is_senior_recruiter'], False, user)
                self.assertEqual(user['name'], self.admin.name, user)
            elif user['id'] == self.senior_recruiter.id:
                self.assertEqual(user['is_admin'], False, user)
                self.assertEqual(user['is_recruiter'], True, user)
                self.assertEqual(user['is_senior_recruiter'], True, user)
                self.assertEqual(user['name'], self.senior_recruiter.name, user)
            elif user['id'] == self.applicant.id:
                self.assertEqual(user['is_admin'], False, user)
                self.assertEqual(user['is_recruiter'], False, user)
                self.assertEqual(user['is_senior_recruiter'], False, user)
                self.assertEqual(user['name'], self.applicant.name, user)

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
        result = get_user_characters(self.applicant.id, current_user=self.recruiter)
        self.assertTrue('info' in result)
        character_dict = result['info']
        self.assertEqual(len(character_dict), 1)
        self.assertTrue(self.applicant.id in character_dict)
        character = character_dict[self.applicant.id]
        for property in ('name', 'corporation_name'):
            self.assertTrue(property in character.keys(), property)

    def test_user_character_list_as_senior_recruiter(self):
        result = get_user_characters(self.applicant.id, current_user=self.senior_recruiter)
        self.assertTrue('info' in result)
        character_dict = result['info']
        self.assertEqual(len(character_dict), 1)
        self.assertTrue(self.applicant.id in character_dict)
        character = character_dict[self.applicant.id]
        for property in ('name', 'corporation_name'):
            self.assertTrue(property in character.keys(), property)

    def test_user_character_list_as_admin(self):
        with self.assertRaises(ForbiddenException):
            get_user_characters(self.applicant.id, current_user=self.admin)

    def test_user_character_list_as_other_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_user_characters(self.applicant.id, current_user=self.other_recruiter)

    def test_user_character_list_as_applicant(self):
        result = get_user_characters(self.applicant.id, current_user=self.applicant)
        self.assertTrue('info' in result)
        character_dict = result['info']
        self.assertEqual(len(character_dict), 1)
        self.assertTrue(self.applicant.id in character_dict)
        character = character_dict[self.applicant.id]
        for property in ('name', 'corporation_name'):
            self.assertTrue(property in character.keys(), property)

    def test_user_corporation_list_as_recruiter(self):
        self.applicant_character.corporation.ceo_id = self.applicant_character.id
        db.session.commit()
        result = get_user_corporations(self.applicant.id, current_user=self.recruiter)
        self.assertTrue('info' in result)
        corporation_dict = result['info']
        self.assertEqual(len(corporation_dict), 1)
        self.assertTrue(self.applicant_character.corporation.id in corporation_dict)
        corporation = corporation_dict[self.applicant_character.corporation.id]
        for property in ('corporation_name', 'ceo_id', 'ceo_name'):
            self.assertTrue(property in corporation.keys(), property)
        self.assertEqual(corporation['ceo_id'], self.applicant.id)
        self.assertEqual(corporation['ceo_name'], self.applicant.name)
        self.assertEqual(corporation['corporation_name'], self.applicant_character.corporation.name)

    def test_user_corporation_list_as_senior_recruiter(self):
        self.applicant_character.corporation.ceo_id = self.applicant_character.id
        db.session.commit()
        result = get_user_corporations(self.applicant.id, current_user=self.senior_recruiter)
        self.assertTrue('info' in result)
        corporation_dict = result['info']
        self.assertEqual(len(corporation_dict), 1)
        self.assertTrue(self.applicant_character.corporation.id in corporation_dict)
        corporation = corporation_dict[self.applicant_character.corporation.id]
        for property in ('corporation_name', 'ceo_id', 'ceo_name'):
            self.assertTrue(property in corporation.keys(), property)
        self.assertEqual(corporation['ceo_id'], self.applicant.id)
        self.assertEqual(corporation['ceo_name'], self.applicant.name)
        self.assertEqual(corporation['corporation_name'], self.applicant_character.corporation.name)

    def test_user_corporation_list_forbidden(self):
        for user in (self.not_applicant, self.applicant, self.other_recruiter):
            with self.assertRaises(ForbiddenException):
                get_user_corporations(self.applicant.id, current_user=user)


class ApplicationHistoryTests(AsceeTestCase):

    def test_empty_history(self):
        result = application_history(self.not_applicant.id, current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertEqual(len(result['info']), 0)

    def test_new_history(self):
        self.application.recruiter_id = None
        self.application.is_submitted = False
        result = application_history(self.applicant.id,
                                     current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], None)
        self.assertEqual(app_data['recruiter_name'], None)
        self.assertEqual(app_data['status'], 'new')
        self.assertEqual(len(app_data['notes']), 0)

    def test_submitted_history(self):
        self.application.recruiter_id = None
        result = application_history(self.applicant.id,
                                     current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], None)
        self.assertEqual(app_data['recruiter_name'], None)
        self.assertEqual(app_data['status'], 'submitted')
        self.assertEqual(len(app_data['notes']), 0)

    def test_claimed_history(self):
        result = application_history(self.applicant.id, current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], self.recruiter.id)
        self.assertEqual(app_data['recruiter_name'], self.recruiter.name)
        self.assertEqual(app_data['status'], 'claimed')
        self.assertEqual(len(app_data['notes']), 0)

    def test_claimed_history_recruiter_access(self):
        result = application_history(self.applicant.id, current_user=self.recruiter)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], self.recruiter.id)
        self.assertEqual(app_data['recruiter_name'], self.recruiter.name)
        self.assertEqual(app_data['status'], 'claimed')
        self.assertEqual(len(app_data['notes']), 0)

    def test_claimed_history_senior_recruiter_access(self):
        result = application_history(self.applicant.id, current_user=self.senior_recruiter)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], self.recruiter.id)
        self.assertEqual(app_data['recruiter_name'], self.recruiter.name)
        self.assertEqual(app_data['status'], 'claimed')
        self.assertEqual(len(app_data['notes']), 0)

    def test_rejected_history(self):
        reject_applicant(self.applicant.id, current_user=self.recruiter)
        result = application_history(self.applicant.id, current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], self.recruiter.id)
        self.assertEqual(app_data['recruiter_name'], self.recruiter.name)
        self.assertEqual(app_data['status'], 'rejected')
        self.assertEqual(len(app_data['notes']), 0)

    def test_accepted_history(self):
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        result = application_history(self.applicant.id, current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], self.recruiter.id)
        self.assertEqual(app_data['recruiter_name'], self.recruiter.name)
        self.assertEqual(app_data['status'], 'accepted')
        self.assertEqual(len(app_data['notes']), 0)

    def test_accepted_history_with_note(self):
        add_applicant_note(self.applicant.id, "A note", title='A Title', is_chat_log=True, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        result = application_history(self.applicant.id, current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], self.recruiter.id)
        self.assertEqual(app_data['recruiter_name'], self.recruiter.name)
        self.assertEqual(app_data['status'], 'accepted')
        self.assertEqual(len(app_data['notes']), 1)
        note_data = app_data['notes'][0]
        self.assertEqual(note_data['text'], 'A note')
        self.assertEqual(note_data['title'], 'A Title')
        self.assertEqual(note_data['author'], self.recruiter.name)
        self.assertTrue(note_data['is_chat_log'])
        for key in ('timestamp', 'author', 'title', 'text', 'id', 'is_chat_log'):
            self.assertIn(key, note_data)

    def test_invited_history(self):
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        invite_applicant(self.applicant.id, current_user=self.senior_recruiter)
        result = application_history(self.applicant.id, current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 1
        the_key = result['info'][0]
        app_data = result['info'][the_key]
        self.assertEqual(app_data['recruiter_id'], self.recruiter.id)
        self.assertEqual(app_data['recruiter_name'], self.recruiter.name)
        self.assertEqual(app_data['status'], 'invited')
        self.assertEqual(len(app_data['notes']), 0)

    def test_two_applications(self):
        reject_applicant(self.applicant.id, current_user=self.recruiter)
        start_application(self.applicant)
        submit_application(self.applicant)
        claim_applicant(self.applicant.id, current_user=self.recruiter)
        accept_applicant(self.applicant.id, current_user=self.recruiter)
        result = application_history(self.applicant.id, current_user=self.admin)
        self.assertIsInstance(result, dict)
        self.assertIn('info', result)
        self.assertIsInstance(result['info'], dict)
        self.assertEqual(len(result['info'])), 2


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

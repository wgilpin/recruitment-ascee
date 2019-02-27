import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
from base import AsceeTestCase
from search import get_search_results, get_names_to_ids, get_ids_to_names
from exceptions import BadRequestException, ForbiddenException
from flask_app import app
from models import db
import unittest


class IDsToNamesTests(AsceeTestCase):

    def test_applicant_name(self):
        response = get_ids_to_names(
            [self.applicant.id],
            current_user=self.admin,
        )
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.id, data)
        self.assertEqual(data[self.applicant.id]['name'], self.applicant.name)
        self.assertEqual(data[self.applicant.id]['redlisted'], False)

    def test_character_redlisted(self):
        self.applicant_character.redlisted = True
        response = get_ids_to_names(
            [self.applicant.id],
            current_user=self.admin,
        )
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.id, data)
        self.assertEqual(data[self.applicant.id]['name'],
                         self.applicant.name)
        self.assertEqual(data[self.applicant.id]['redlisted'], True)

    def test_character_redlisted_by_corporation(self):
        self.assertEqual(self.applicant_character.redlisted, False)
        self.applicant_character.corporation.redlisted = True
        response = get_ids_to_names(
            [self.applicant.id],
            current_user=self.admin,
        )
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.id, data)
        self.assertEqual(data[self.applicant.id]['name'],
                         self.applicant.name)
        self.assertEqual(data[self.applicant.id]['redlisted'], True)

    def test_get_jita_name(self):
        jita_id = 30000142
        response = get_ids_to_names(
            [jita_id],
            current_user=self.admin,
        )
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(jita_id, data)
        self.assertEqual(data[jita_id]['name'], 'Jita')
        self.assertEqual(data[jita_id]['redlisted'], False)

    def test_get_empty_list(self):
        response = get_ids_to_names(
            [],
            current_user=self.admin,
        )
        self.assertIn('info', response)
        data = response['info']
        self.assertEqual(len(data), 0)

    def test_no_applicant_access(self):
        with self.assertRaises(ForbiddenException):
            get_ids_to_names([self.applicant.id], current_user=self.applicant)

    def test_no_not_applicant_access(self):
        with self.assertRaises(ForbiddenException):
            get_ids_to_names([self.applicant.id], current_user=self.not_applicant)


class NamesToIDsTests(AsceeTestCase):

    def test_search_for_applicant(self):
        response = get_names_to_ids(
            'character', [self.applicant.name], current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.name, data)
        self.assertEqual(data[self.applicant.name], self.applicant.id)
        self.assertEqual(len(data), 1)

    def test_search_for_applicant_as_recruiter(self):
        response = get_names_to_ids(
            'character', [self.applicant.name], current_user=self.recruiter)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.name, data)
        self.assertEqual(data[self.applicant.name], self.applicant.id)
        self.assertEqual(len(data), 1)

    def test_search_for_applicant_as_senior_recruiter(self):
        response = get_names_to_ids(
            'character', [self.applicant.name], current_user=self.senior_recruiter)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.name, data)
        self.assertEqual(data[self.applicant.name], self.applicant.id)
        self.assertEqual(len(data), 1)

    def test_search_for_two_characters_full_match(self):
        response = get_names_to_ids(
            'character', [self.applicant.name, self.not_applicant.name], current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.name, data)
        self.assertEqual(data[self.applicant.name], self.applicant.id)
        self.assertIn(self.not_applicant.name, data)
        self.assertEqual(data[self.not_applicant.name], self.not_applicant.id)
        self.assertEqual(len(data), 2)

    def test_search_for_jita(self):
        response = get_names_to_ids(
            'system', ['Jita'], current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn('Jita', data)
        self.assertEqual(data['Jita'], 30000142)
        self.assertEqual(len(data), 1)

    def test_search_for_querious(self):
        response = get_names_to_ids(
            'region', ['Querious'], current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn('Querious', data)
        self.assertEqual(data['Querious'], 10000050)
        self.assertEqual(len(data), 1)

    def test_search_for_ascendance(self):
        response = get_names_to_ids(
            'corporation', ['Ascendance'], current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn('Ascendance', data)
        self.assertEqual(data['Ascendance'], 98409330)
        self.assertEqual(len(data), 1)

    def test_search_no_result(self):
        response = get_names_to_ids(
            'character', ['erajlfdskhaahouirwaeiouw'], current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertEqual(len(data), 0)

    def test_search_no_applicant_access(self):
        with self.assertRaises(ForbiddenException):
            get_names_to_ids('character', [self.applicant.name], current_user=self.applicant)

    def test_search_no_not_applicant_access(self):
        with self.assertRaises(ForbiddenException):
            get_names_to_ids('character', [self.applicant.name], current_user=self.not_applicant)

    def test_search_invalid_category(self):
        with self.assertRaises(BadRequestException):
            get_names_to_ids('type', ['Tritanium'], current_user=self.admin)


class SearchTests(AsceeTestCase):

    def test_search_for_applicant_full_match(self):
        response = get_search_results(
            'character', self.applicant.name, current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.id, data)
        self.assertEqual(data[self.applicant.id], self.applicant.name)

    def test_search_for_applicant_partial_match(self):
        response = get_search_results(
            'character', self.applicant.name[:5], current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(self.applicant.id, data)
        self.assertEqual(data[self.applicant.id], self.applicant.name)

    def test_search_for_jita(self):
        response = get_search_results(
            'system', 'Jita', current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(30000142, data)
        self.assertEqual(data[30000142], 'Jita')

    def test_search_for_querious(self):
        response = get_search_results(
            'region', 'Querious', current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(10000050, data)
        self.assertEqual(data[10000050], 'Querious')

    def test_search_for_ascendance(self):
        response = get_search_results(
            'corporation', 'Ascendance', current_user=self.admin)
        self.assertIn('info', response)
        data = response['info']
        self.assertIn(98409330, data)
        self.assertEqual(data[98409330], 'Ascendance')

    def test_search_no_result(self):
        response = get_search_results(
            'character', 'reafldksjcjluresfda', current_user=self.admin
        )
        self.assertIn('info', response)
        data = response['info']
        self.assertEqual(len(data), 0)

    def test_search_no_applicant_access(self):
        with self.assertRaises(ForbiddenException):
            get_search_results('character', self.applicant.name, current_user=self.applicant)

    def test_search_no_not_applicant_access(self):
        with self.assertRaises(ForbiddenException):
            get_search_results('character', self.applicant.name, current_user=self.not_applicant)

    def test_search_invalid_category(self):
        with self.assertRaises(BadRequestException):
            get_search_results('type', 'Hel', current_user=self.admin)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

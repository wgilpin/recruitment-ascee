import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
from base import AsceeTestCase
from search import get_search_results, get_names_to_ids
from exceptions import BadRequestException, ForbiddenException
from flask_app import app
from models import db
import unittest


class SearchTests(AsceeTestCase):

    def test_search_for_applicant_full_match(self):
        response = get_search_results(
            'character', self.applicant.name, current_user=self.admin)
        data = response['info']
        self.assertIn(self.applicant.id, data)
        self.assertEqual(data[self.applicant.id], self.applicant.name)

    def test_search_for_applicant_partial_match(self):
        response = get_search_results(
            'character', self.applicant.name[:5], current_user=self.admin)
        data = response['info']
        self.assertIn(self.applicant.id, data)
        self.assertEqual(data[self.applicant.id], self.applicant.name)

    def test_search_for_jita(self):
        response = get_search_results(
            'solar_system', 'Jita', current_user=self.admin)
        data = response['info']
        self.assertIn(30000142, data)
        self.assertEqual(data[30000142], 'Jita')

    def test_search_for_querious(self):
        response = get_search_results(
            'region', 'Querious', current_user=self.admin)
        data = response['info']
        self.assertIn(10000050, data)
        self.assertEqual(data[10000050], 'Querious')

    def test_search_for_ascendance(self):
        response = get_search_results(
            'corporation', 'Ascendance', current_user=self.admin)
        data = response['info']
        self.assertIn(98409330, data)
        self.assertEqual(data[98409330], 'Ascendance')

    def test_search_no_result(self):
        response = get_search_results(
            'character', 'reafldksjcjluresfda', current_user=self.admin
        )
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

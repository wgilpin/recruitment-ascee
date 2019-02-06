import sys
import os
server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))

import unittest
from character_data import get_character_assets
from models import db, Region, System
from base import AsceeTestCase
from flask_app import app
from exceptions import BadRequestException, ForbiddenException
import pprint


class CharacterAssetsTests(AsceeTestCase):

    def test_get_applicant_assets(self):
        result = get_character_assets(self.applicant.id, current_user=self.recruiter)
        self.helper_test_assets_success(result)

    def test_get_applicant_assets_as_senior_recruiter(self):
        result = get_character_assets(self.applicant.id, current_user=self.senior_recruiter)
        self.helper_test_assets_success(result)

    def helper_test_assets_success(self, result):
        for region_id, region_data in result.items():
            if region_id > 0:
                region = Region.get(region_id)
                self.assertEqual(region_data['name'], region.name)
            self.assertIsInstance(region_data['items'], dict)
            for system_id, system_data in region_data['items'].items():
                if system_id > 0:
                    system = System.get(system_id)
                    self.assertIsInstance(system_data, dict)
                    self.assertEqual(system_data['name'], system.name)
                self.assertIsInstance(system_data['items'], dict)
                for structure_id, structure_data in system_data['items'].items():
                    self.assertIsInstance(structure_data, dict)
                    self.assertIsInstance(structure_data['name'], str)
                    self.assertIsInstance(structure_data['items'], dict)
                    for identifier, data in structure_data['items'].items():
                        self.assertIsInstance(identifier, int)
                        self.helper_process_asset_item(data)

    def helper_process_asset_item(self, data):
        item_properties = {
            'is_singleton': bool,
            'item_id': int,
            'location_flag': str,
            'type_id': int,
            'type_name': str,
            'location_id': int,
            'location_type': str,
            'quantity': int,
            'price': float,
        }
        for prop, prop_type in item_properties.items():
            self.assertIsInstance(data, dict, data)
            self.assertIsInstance(data[prop], prop_type, data)
        if 'items' in data:
            for item in data['items'].values():
                try:
                    self.helper_process_asset_item(item)
                except AssertionError as err:
                    pprint.pprint(data)
                    raise err

    def test_get_applicant_assets_as_other_recruiter(self):
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.applicant.id, current_user=self.other_recruiter)

    def test_get_applicant_assets_as_admin(self):
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.applicant.id, current_user=self.admin)

    def test_get_recruiter_assets(self):
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.recruiter.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.recruiter.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.recruiter.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.recruiter.id, current_user=self.admin)

    def test_get_admin_assets(self):
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.admin.id, current_user=self.recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.admin.id, current_user=self.other_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.admin.id, current_user=self.senior_recruiter)
        with self.assertRaises(ForbiddenException):
            get_character_assets(self.admin.id, current_user=self.admin)


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

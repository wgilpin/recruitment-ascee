import sys
import os

import character.bookmarks
import character.contacts
import character.finance
import character.mining

server_dir = os.environ["ASCEE_RECRUIT_SERVER_DIR"]
sys.path.insert(1, server_dir)
sys.path.insert(1, os.path.join(server_dir, 'lib'))
from exceptions import BadRequestException, ForbiddenException
import unittest
import character
from models import Character, User, db, Type, Region, System, Corporation, Alliance, Station
from base import AsceeTestCase
from flask_app import app
import warnings


class SimpleCharacterMixin(object):

    api_definition = None

    def helper_list_or_dict_item(self, entry, api_def):
        for property_name, property_type in api_def['required'].items():
            self.assertIn(property_name, entry, property_name)
            self.assertIsInstance(entry[property_name], property_type, property_name)
        for property_name, property_type in api_def['optional'].items():
            if property_name in entry:
                self.assertIsInstance(entry[property_name], property_type, property_name)

    def helper_simple_APIs(self, response, api_def):
        self.assertIn('info', response)
        if isinstance(response['info'], dict):
            for key, entry in response['info'].items():
                self.helper_list_or_dict_item(entry, api_def)
        elif isinstance(response['info'], list):
            for entry in response['info']:
                self.helper_list_or_dict_item(entry, api_def)

    def helper_redlisting_simple_apis(self, subject, current_user):
        response = self.api_definition['fetch_function'](subject, current_user=current_user)
        entry_identifier = self.api_definition['entry_identifier']
        entry_list = response['info']
        if isinstance(entry_list, dict):
            entry_list = list(entry_list.values())
        self.assertGreater(len(entry_list), 0, 'Cannot test redlisting without entries')
        target_redlist = {
        }
        for red_name, spec in self.api_definition['redlisting'].items():
            if isinstance(spec, (tuple, list)):
                cls, target_id_name = spec
                redlisted_id = None
                for entry in entry_list:
                    if entry.get(target_id_name, None) is not None:
                        target_id = entry[target_id_name]
                        if redlisted_id is None:
                            cls.get(target_id).redlisted = True
                            redlisted_id = target_id
                        if redlisted_id == target_id:
                            entry_id = entry[entry_identifier]
                            target_redlist[entry_id] = target_redlist.get(entry_id, {})
                            target_redlist[entry_id]['redlisted'] = target_redlist[entry_id].get('redlisted', [])
                            target_redlist[entry_id]['redlisted'].append(red_name)
                if redlisted_id is None:
                    self.fail('Could not find an entry for {} to redlist'.format(red_name))
            elif isinstance(spec, dict):
                for second_red_name, second_spec in spec.items():
                    if second_red_name != 'entry_identifier':
                        cls, target_id_name = second_spec
                        identifier = spec['entry_identifier']
                        redlisted_id = None
                        for entry in entry_list:
                            entry_redlisted = False
                            for item in entry[red_name]:
                                id = item[identifier]
                                if redlisted_id is None:
                                    cls.get(id).redlisted = True
                                    redlisted_id = id
                                if id == redlisted_id:
                                    entry_redlisted = True
                                    entry_id = entry[entry_identifier]
                                    target_redlist[entry_id] = target_redlist.get(entry_id, {})
                                    target_redlist[entry_id][red_name] = target_redlist[entry_id].get(red_name, {})
                                    target_redlist[entry_id][red_name][id] = target_redlist[entry_id][red_name].get('id', {})
                                    target_redlist[entry_id][red_name][id]['redlisted'] = target_redlist[entry_id][red_name][id].get('redlisted', [])
                                    target_redlist[entry_id][red_name][id]['redlisted'].append(second_red_name)
                            if entry_redlisted:
                                target_redlist[entry_id]['redlisted'] = target_redlist[entry_id].get('redlisted', [])
                                target_redlist[entry_id]['redlisted'].append(red_name)
                        if redlisted_id is None:
                            self.fail('Could not find an entry for {}.{} to redlist'.format(red_name, second_red_name))
            else:
                self.fail('Spec for redlist name {} is of invalid type {}'.format(red_name, type(spec)))
        db.session.commit()

        response = self.api_definition['fetch_function'](subject, current_user=current_user)
        entry_list = response['info']
        if isinstance(entry_list, dict):
            entry_list = list(entry_list.values())
        self.helper_simple_APIs(response, self.api_definition)  # ensure redlisting doesn't cause api to break
        for entry in entry_list:
            target_dict = target_redlist.get(entry[entry_identifier], {'redlisted': []})
            entry_redlist = set(entry.get('redlisted', []))
            for red_name in target_dict['redlisted']:
                self.assertIn(red_name, entry_redlist)
            list_names = set(target_dict.keys()).difference(['redlisted'])
            for list_name in list_names:
                for item in entry.get(list_name, []):
                    second_identifier = self.api_definition['redlisting'][list_name]['entry_identifier']
                    target_second_redlist = target_dict[list_name].get(item[second_identifier], {'redlisted': []})['redlisted']
                    for red_name in target_second_redlist:
                        self.assertIn(red_name, item.get('redlisted', []))

    def test_only_valid_types_returned(self):
        api_def = self.api_definition
        method = api_def['fetch_function']
        response = method(self.applicant.id, current_user=self.recruiter)
        self.ensure_only_valid_types(response)

    def ensure_only_valid_types(self, d):
        for k, v in d.items():
            self.assertIsInstance(k, (int, str), k)
            if isinstance(v, dict):
                self.ensure_only_valid_types(v)
            elif isinstance(v, (list, tuple)):
                for item in v:
                    if isinstance(item, dict):
                        self.ensure_only_valid_types(item)
                    else:
                        self.assertIsInstance(item, (int, str))
            else:
                self.assertIsInstance(v, (int, float, str, type(None)), k)

    def run_tests_simple_APIs(self, subject, current_user, exception=None):
        api_def = self.api_definition
        method = api_def['fetch_function']
        if exception:
            with self.assertRaises(exception):
                method(subject, current_user=current_user)
        else:
            response = method(subject, current_user=current_user)
            self.helper_simple_APIs(response, api_def)

    def test_redlisting(self):
        self.helper_redlisting_simple_apis(self.applicant.id, self.recruiter)

    def test_API(self):
        self.run_tests_simple_APIs(self.applicant.id, self.recruiter)

    def test_API_as_senior_recruiter(self):
        self.run_tests_simple_APIs(self.applicant.id, self.senior_recruiter)

    def test_API_as_other_recruiter(self):
        self.run_tests_simple_APIs(self.applicant.id, self.other_recruiter)

    def test_API_as_non_recruiter(self):
        self.run_tests_simple_APIs(self.applicant.id, self.not_applicant, ForbiddenException)

    def test_API_as_admin(self):
        self.run_tests_simple_APIs(self.applicant.id, self.admin, ForbiddenException)

    def test_get_recruiter_API(self):
        self.run_tests_simple_APIs(self.recruiter.id, self.recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.recruiter.id, self.other_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.recruiter.id, self.senior_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.recruiter.id, self.admin, ForbiddenException)

    def test_get_admin_API(self):
        self.run_tests_simple_APIs(self.admin.id, self.recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.admin.id, self.other_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.admin.id, self.senior_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.admin.id, self.admin, ForbiddenException)

    def test_get_not_applicant_API(self):
        self.run_tests_simple_APIs(self.not_applicant.id, self.recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.not_applicant.id, self.other_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.not_applicant.id, self.senior_recruiter, ForbiddenException)
        self.run_tests_simple_APIs(self.not_applicant.id, self.admin, ForbiddenException)


class CharacterJournalTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.get_character_journal,
        'required': {
            'date': str,
            'description': str,
            'id': int,
            'ref_type': str,
        },
        'optional': {
            'amount': float,
            'balance': float,
            'context_id': int,
            'context_id_type': str,
            'first_party_id': int,
            'second_party_id': int,
            'first_party': dict,
            'second_party': dict,
        },
        'redlisting': {
        },
        'entry_identifier': 'id',
    }


class CharacterTransactionsTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.get_character_transactions,
        'required': {
            'client_id': int,
            'date': str,
            'is_buy': bool,
            'is_personal': bool,
            'journal_ref_id': int,
            'location_id': int,
            'location_name': str,
            'quantity': int,
            'transaction_id': int,
            'type_id': int,
            'type_name': str,
            'unit_price': float,
            'total_value': float,
        },
        'optional': {},
        'redlisting': {
            'type_name': (Type, 'type_id'),
        },
        'entry_identifier': 'transaction_id',
    }


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

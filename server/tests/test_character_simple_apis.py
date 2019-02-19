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
                    if target_id_name in entry:
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
                self.assertIn(red_name, entry_redlist, red_name)
            list_names = set(target_dict.keys()).difference(['redlisted'])
            for list_name in list_names:
                for item in entry.get(list_name, []):
                    second_identifier = self.api_definition['redlisting'][list_name]['entry_identifier']
                    target_second_redlist = target_dict[list_name].get(item[second_identifier], {'redlisted': []})['redlisted']
                    for red_name in target_second_redlist:
                        self.assertIn(red_name, item.get('redlisted', []), red_name)

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
        self.helper_redlisting_simple_apis(self.applicant.id, self.recruiter.user)

    def test_API(self):
        self.run_tests_simple_APIs(self.applicant.id, self.recruiter.user)

    def test_API_as_senior_recruiter(self):
        self.run_tests_simple_APIs(self.applicant.id, self.senior_recruiter.user)

    def test_API_as_other_recruiter(self):
        self.run_tests_simple_APIs(self.applicant.id, self.other_recruiter.user, ForbiddenException)

    def test_API_as_admin(self):
        self.run_tests_simple_APIs(self.applicant.id, self.admin.user, ForbiddenException)

    def test_get_recruiter_API(self):
        self.run_tests_simple_APIs(self.recruiter.id, self.recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.recruiter.id, self.other_recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.recruiter.id, self.senior_recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.recruiter.id, self.admin.user, ForbiddenException)

    def test_get_admin_API(self):
        self.run_tests_simple_APIs(self.admin.id, self.recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.admin.id, self.other_recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.admin.id, self.senior_recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.admin.id, self.admin.user, ForbiddenException)

    def test_get_not_applicant_API(self):
        self.run_tests_simple_APIs(self.not_applicant.id, self.recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.not_applicant.id, self.other_recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.not_applicant.id, self.senior_recruiter.user, ForbiddenException)
        self.run_tests_simple_APIs(self.not_applicant.id, self.admin.user, ForbiddenException)


class CharacterFittingsTests(SimpleCharacterMixin, AsceeTestCase):

    # results from ESI, Each result additionally has the key 'ship_type_name',
    # and each item has the additional key 'type_name'.
    api_definition = {
        'fetch_function': character.fittings.get_character_fittings,
        'required': {
            'description': str,
            'fitting_id': int,
            'items': list,
            'name': str,
            'ship_type_id': int,
            'ship_type_name': str,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'ship_type_name': (Type, 'ship_type_id'),
            'items': {
                'type_name': (Type, 'type_id'),
                'entry_identifier': 'type_id',
            },
        },
        'entry_identifier': 'fitting_id',
    }

    def helper_simple_APIs(self, response, api_def):
        super(CharacterFittingsTests, self).helper_simple_APIs(response, api_def)
        for data in response['info']:
            for item in data['items']:
                for attr, type in (
                        ('flag', int),
                        ('quantity', int),
                        ('type_id', int),
                        ('type_name', str)):
                    self.assertIn(attr, item, attr)
                    self.assertIsInstance(item[attr], type, attr)


class CharacterContactsTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.contacts.get_character_contacts,
        'required': {
            'name': str,
            'contact_id': int,
            'contact_type': str,
            'redlisted': list,
        },
        'optional': {
            'corporation_id': int,
            'corporation_name': str,
            'alliance_id': int,
            'alliance_name': str,
        },
        'redlisting': {
            'corporation_name': (Corporation, 'corporation_id'),
            'alliance_name': (Alliance, 'alliance_id'),
        },
        'entry_identifier': 'contact_id',
    }


class CharacterMiningTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.mining.get_character_mining,
        'required': {
            'date': str,
            'quantity': int,
            'system_id': int,
            'system_name': str,
            'type_id': int,
            'type_name': str,
            'value': float,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'system_name': (System, 'system_id'),
        },
        # it's fine that this can match multiple entries, since we're only testing system redlisting
        'entry_identifier': 'system_id',
    }


class CharacterBlueprintsTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.get_character_blueprints,
        'required': {
            'item_id': int,
            'location_flag': str,
            'location_id': int,
            'material_efficiency': int,
            'quantity': int,
            'runs': int,
            'time_efficiency': int,
            'type_id': int,
            'type_name': str,
            'system_id': int,
            'system_name': str,
        },
        'optional': {
        },
        'redlisting': {
            'system_name': (System, 'system_id'),
            'type_name': (Type, 'type_id'),
        },
        'entry_identifier': 'item_id',
    }


class CharacterPITests(SimpleCharacterMixin, AsceeTestCase):
    api_definition = {
        'fetch_function': character.planetary_interaction.get_character_planetary_interaction,
        'required': {
            'last_update': str,
            'num_pins': int,
            'owner_id': int,
            'planet_id': int,
            'planet_type': str,
            'system_id': int,
            'system_name': str,
            'region_id': int,
            'region_name': str,
            'upgrade_level': int,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'system_name': (System, 'system_id'),
            'region_name': (Region, 'region_id'),
        },
        'entry_identifier': 'planet_id',
    }


class CharacterIndustryTests(SimpleCharacterMixin, AsceeTestCase):
    api_definition = {
        'fetch_function': character.industry.get_character_industry,
        'required': {
            'activity_id': int,
            'blueprint_id': int,
            'blueprint_location_id': int,
            'blueprint_type_id': int,
            'blueprint_type_name': str,
            'duration': int,
            'end_date': str,
            'facility_id': int,
            'installer_id': int,
            'job_id': int,
            'output_location_id': int,
            'runs': int,
            'start_date': str,
            'station_id': int,
            'status': str,
            'redlisted': list,
        },
        'optional': {
            'completed_character_id': int,
            'completed_date': str,
            'cost': float,
            'licensed_runs': int,
            'pause_date': str,
            'probability': float,
            'product_type_id': int,
            'successful_runs': int,
        },
        'entry_identifier': 'activity_id',
        'redlisting': {
            'station_name': (Station, 'station_id'),
            'blueprint_type_name': (Type, 'blueprint_type_id'),
        },
    }


class CharacterMarketContractsTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.finance.get_character_market_contracts,
        'required': {
            'issuer_corporation_name': str,
            'issuer_corporation_id': int,
            'issuer_id': int,
            'acceptor_id': int,
            'issuer_name': str,
            'acceptor_name': str,
            'redlisted': list,
            'contract_id': int,
        },
        'optional': {
            'start_location_id': int,
            'start_location_name': str,
            'end_location_id': int,
            'end_location_name': str,
        },
        'redlisting': {
            'issuer_name': (Character, 'issuer_id'),
            'acceptor_name': (Character, 'acceptor_id'),
            'issuer_corporation_name': (Corporation, 'issuer_corporation_id'),
        },
        'entry_identifier': 'contract_id',
    }


class CharacterBookmarksTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.bookmarks.get_character_bookmarks,
        'required': {
            'system_id': int,
            'system_name': str,
            'redlisted': list,
            'bookmark_id': int,
            'notes': str,
            'location_id': int,
            'creator_id': int,
            'label': str,
        },
        'optional': {
            'folder_id': int,
            'folder_name': str,
        },
        'redlisting': {
            'system_name': (System, 'system_id'),
        },
        'entry_identifier': 'bookmark_id',
    }


class CharacterMarketHistoryTests(SimpleCharacterMixin, AsceeTestCase):

    api_definition = {
        'fetch_function': character.finance.get_character_market_history,
        'required': {
            'order_id': int,
            'is_buy_order': bool,
            'value': float,
            'price': float,
            'volume_total': int,
            'location_name': str,
            'region_id': int,
            'region_name': str,
            'type_id': int,
            'type_name': str,
            'redlisted': list,
        },
        'optional': {
        },
        'redlisting': {
            'type_name': (Type, 'type_id'),
            'region_name': (Region, 'region_id'),
        },
        'entry_identifier': 'order_id',
    }


if __name__ == '__main__':
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['TESTING'] = True
    with app.app_context():
        db.init_app(app)
        db.create_all()
        unittest.main()

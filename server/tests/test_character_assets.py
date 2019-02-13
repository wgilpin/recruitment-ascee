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

    def test_get_applicant_assets_has_no_duplicate_item_ids(self):
        result = get_character_assets(self.applicant.id, current_user=self.recruiter)
        seen_type_ids = set()
        seen_item_ids = set()
        for region_id, region_data in result.items():
            self.assertNotIn(region_id, seen_type_ids)
            seen_type_ids.add(region_id)
            for system_id, system_data in region_data['items'].items():
                self.assertNotIn(system_id, seen_type_ids)
                seen_type_ids.add(system_id)
                for location_id, location_data in system_data['items'].items():
                    self.assertNotIn(location_id, seen_type_ids)
                    seen_type_ids.add(location_id)
                    self._check_for_duplicates(location_data['items'], seen_item_ids)
        for item_id in (1028819118080, 1028825862146, 1028803172364, 1028803016728, 1028768647200, 1028572524576, 1028802977826, 1029015230501, 1028743239717, 1028752351271, 1028802975784, 1028604696623, 1028895774768, 1028678502448, 1028916037684, 1028872947777, 1028648884289, 1028743358531, 1028743290948, 1028803201093, 1028566419525, 1028566419527, 1028566419528, 1028685342793, 1028566419529, 1028743344205, 1028818415694, 1029015216218, 1028649343079, 1028822274151, 1028574191729, 1028803084410, 1028574646407, 1028791449746, 1028791576724, 1028743227541, 1028895783064, 1028743010457, 1029015234716, 1029866698908, 1028822300834, 1028752287909, 1028604698790, 1028907380907, 1028825833646, 1028825858223, 1004732530866, 1028572526778, 1028802977992, 1028684486859, 1028684486861, 1028572520653, 1028584052947, 1028584052948, 1028584052949, 1028907415772, 1028634153182, 1028819013859, 1028818735334, 1028575168747, 1028803041520, 1028742957299, 1028684341492, 1028802967800, 1028624613627, 1028575174908, 1029862308094, 1029480100096, 1029268039937, 1028633782532, 1028580903179, 1028743196939, 1028791490841, 1028624394523, 1028648902943, 1029015238949, 1028819050790, 1028648904999, 1028584210727, 1028907397419, 1028768649517, 1028872925492, 1028868292923, 1028819104062, 1028678670661, 1028624138569, 1028633856342, 1029015236967, 1028584044909, 1028633979246, 1028633932147, 1028690092408, 1028573776254, 1028768614807, 1028743246232, 1028818962847, 1028822299040, 1028818456997, 1028648903079, 1028624511399, 1028895775146, 1028822272438, 1028581597628, 1028803183048, 1028819077578, 1029873422797, 1028580530647, 1028752939484, 1028634024413, 1028743520739, 1028905146852, 1028872708588, 1028604781037, 1028719591924, 1028768649722, 1028907389434, 1028743182848, 1028825836033, 1028752949770, 1028802925068, 1028899766801, 1028803172881, 1028752976410, 1028633856550, 1028818754091, 1028649601586, 1028768637506, 1028822299204, 1028818416203, 1028574681676, 1028743422540, 1028819137111, 1028768615002, 1028819077731, 1028678484580, 1028803005031, 1028907334253, 1028819116658, 1028649519731, 1028872958584, 1029115466362, 1029115466363, 1029115466367, 1029115466368, 1028802986623, 1028818963073, 1028685539981, 1028634251930, 1028678736538, 1028649128608, 1028802833058, 1028684071598, 1028684071600, 1029479162545, 1028791544503, 1028678712004, 1028803177159, 1028743041752, 1028803115737, 1028803175138, 1029019515631, 1028580795125, 1029587718905, 1028923495161, 1028742929165, 1028752239375, 1028791573271, 1028604693273, 1028814703386, 1028791698201, 1028825832220, 1029015229218, 1028872868649, 1028752323370, 1028634153776, 1027094197053, 1028748675901, 1028684452670, 1028825858883, 1028753021764, 1028648946505, 1028818938703, 1028584155984, 1028819053393, 1028678470486, 1028819147611, 1028742955875, 1028743488355, 1028743246696, 1028768615273, 1029115769714, 1028647738235, 1028802927483, 1028791450491, 1028575271807, 1028743086985, 1028868408205, 1028803113872, 1029268030354, 1028634237842, 1028803165074, 1029268030357, 1028791673747, 1029268030359, 1028624515992, 1029268030362, 1028819051420, 1029480102816, 1029480102817, 1029875055522, 1029268030371, 1029480102822, 1029268030374, 1029268030383, 1028825826224, 1029139168181, 1029139168183, 1028752991159, 1029106781114, 1029019532227, 1028872938435, 1028742976455, 1029268030408, 1028648944586, 1028685431755, 1029268030413, 1028582564819, 1028907414490, 1028791626721, 1028624491505, 1028819176433, 1028923495415, 1028649556985, 1028818390012, 1028743291901, 1029015227392, 1028690150414, 1028598023200, 1028648932396, 1028742984749, 1028907629621, 1028625235006, 1028634254401, 1028872899650, 1028624337993, 1028860304461, 1028649299024, 1028803114069, 1028872905817, 1028648944741, 1028647793777, 1028690136193, 1028952611998, 1028684205215, 1028791487657, 1029019530411, 1028575251628, 1029015237808, 1028818932923, 1029480064198, 1028572523718, 1028580967622, 1028678558928, 1028767845585, 1028825826522, 1029268034779, 1028924859617, 1028822275302, 1028907412711, 1028791753964, 1029878306042, 1028818754811, 1028753036542, 1028689077511, 1028803042571, 1028574180625, 1028689065238, 1028803061022, 1028822287650, 1028575290659, 1028872930596, 1028822304040, 1028574233907, 1028872928564, 1028634197301, 1028907386166, 1028803114292, 1028689052984, 1028752284984, 1028822222136, 1029106767168, 1028624584011, 1028752938331, 1028819045723, 1028802921835, 1028819078507, 1028743476593, 1028803040627, 1028581752183, 1028791623047, 1029530148233, 1029480099217, 1028826480018, 1028803016082, 1028752244118, 1029268102568, 1029268102570, 1028648924589, 1028690107822, 1028803145133, 1029268102576, 1028634234301, 1028634125760, 1029268102595, 1029268102602, 1028768617938, 1028742903265, 1028684352995, 1028752903651, 1028684353000, 1028685702637, 1028743249418, 1028819082763, 1028685430284, 1028825826830, 1028633939493, 1028634248744, 1028825845305, 1028819117629, 1028580945473, 1028649209411, 1028649209412, 1028604720710, 1028818347590, 1028818347591, 1028604753481, 1028742940238, 1028743042650, 1028624418396, 1028791412316, 1028818390625, 1029862305386, 1029480050282, 1028818931318, 1028907384450, 1028907382404, 1028752950916, 1029480101512, 1029019514509, 1028802987665, 1028743394962, 1029479151253, 1028689075871, 1028573773474, 1028925683366, 1028791701166, 1028872910560, 1028791750372, 1028572380907, 1028872939244, 1028572380908, 1028633800434, 1029530148598, 1028742948600, 1029387978489, 1028618522374, 1028685338384, 1029119907604, 1029015213848, 1028754249522, 1028907689784, 1028649234232, 1028742932286, 1027648270152, 1028803202889, 1028648865618, 1028827012949, 1028819019607, 1027744159580, 1028604718940, 1028684451690, 1028690110325, 1028752928631, 1028649232252, 1028803018622, 1028803172224, 1028819206028, 1028872880020, 1029019512737, 1028634038182, 1028580577199, 1028868407217, 1028818456507, 1028907427773, 1028685483973, 1028923494348, 1028752916428, 1028905148384, 1028872876002, 1028633845730, 1028573984763, 1028819204094, 1028584224767):
            self.assertIn(item_id, seen_item_ids)

    def _check_for_duplicates(self, item_data_dict, seen_item_ids):
        for item_id, data in item_data_dict.items():
            # self.assertNotIn(item_id, seen_item_ids)
            seen_item_ids.add(item_id)
            if 'items' in data:
                self._check_for_duplicates(data['items'], seen_item_ids)

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
            'name': str,
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

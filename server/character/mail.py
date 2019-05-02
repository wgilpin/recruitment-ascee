from esi import get_op
from models import Character, Corporation, Alliance
from security import character_application_access_check
from exceptions import ESIException
import sys


class MailingList(object):

    is_redlisted = False
    
    def __init__(self, name):
        self.name = name


def get_from_names(from_id_list):
    try:
        name_data = get_op(
            'post_universe_names', ids=from_id_list,
        )
    except ESIException as err:
        exc_info = sys.exc_info()
        if 'Ensure all IDs' in str(err):
            if len(from_id_list) == 1:
                name_data = [
                    {'id': from_id_list[0], 'category': 'mailing_list',
                     'name': 'Mailing List {}'.format(from_id_list[0])}]
            else:
                i_half = len(from_id_list) // 2
                name_data = get_from_names(from_id_list[:i_half])
                name_data.extend(get_from_names(from_id_list[i_half:]))
        else:
            raise exc_info[0].with_traceback(exc_info[1], exc_info[2])
    return name_data


def get_character_mail(character_id, last_mail_id=None, current_user=None):
    target_character = Character.get(character_id)
    character_application_access_check(current_user, target_character)
    if last_mail_id:
        kwargs = {'last_mail_id': last_mail_id}
    else:
        kwargs = {}
    mail_list = target_character.get_op(
        'get_characters_character_id_mail',
        character_id=character_id,
        **kwargs
    )

    from_ids = set(entry['from'] for entry in mail_list)
    if from_ids:
        character_ids = set()
        corp_ids = set()
        alliance_ids = set()
        mailing_list_ids = set()
        id_set_dict = {
            'character': character_ids,
            'corporation': corp_ids,
            'alliance': alliance_ids,
            'mailing_list': mailing_list_ids,
        }
        name_data = get_from_names(list(from_ids))
        for entry in name_data:
            id_set_dict[entry['category']].add(entry['id'])
        for entry in mail_list:
            for recipient in entry['recipients']:
                id_set_dict[recipient['recipient_type']].add(recipient['recipient_id'])

        characters = Character.get_multi(character_ids)
        corporations = Corporation.get_multi(corp_ids)
        alliances = Alliance.get_multi(alliance_ids)
        all_parties = {}
        all_parties.update(characters)
        all_parties.update(corporations)
        all_parties.update(alliances)
        for id in mailing_list_ids:
            all_parties[id] = MailingList('Mailing List {}'.format(id))

    for entry in mail_list:
        entry['redlisted'] = []
        entry['from_name'] = all_parties[entry['from']].name
        recipients_redlisted = False
        for recipient in entry['recipients']:
            recipient['recipient_name'] = all_parties[recipient['recipient_id']].name
            if all_parties[recipient['recipient_id']].is_redlisted:
                recipient['redlisted'] = ['recipient_name']
            else:
                recipient['redlisted'] = []
        if recipients_redlisted:
            entry['redlisted'].append('recipients')
        if all_parties[entry['from']].is_redlisted:
            entry['redlisted'].append('from_name')
    return {'info': mail_list}


def get_mail_body(character_id, mail_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    mail_data = character.get_op(
        'get_characters_character_id_mail_mail_id',
        character_id=character_id,
        mail_id=mail_id,
    )
    return mail_data['body']
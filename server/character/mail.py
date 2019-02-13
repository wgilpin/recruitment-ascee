from esi import get_op
from models import Character, Corporation, Alliance
from security import character_application_access_check


def get_character_mail(character_id, current_user=None):
    target_character = Character.get(character_id)
    character_application_access_check(current_user, target_character)
    mail_list = target_character.get_op(
        'get_characters_character_id_mail',
        character_id=character_id,
    )

    from_ids = set(entry['from'] for entry in mail_list)
    character_ids = set()
    corp_ids = set()
    alliance_ids = set()
    id_set_dict = {
        'character': character_ids,
        'corporation': corp_ids,
        'alliance': alliance_ids
    }
    name_data = get_op(
        'post_universe_names', ids=list(from_ids)
    )
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

    for entry in mail_list:
        entry['from_name'] = all_parties[entry['from']].name
        for recipient in entry['recipients']:
            recipient['recipient_name'] = all_parties[recipient['recipient_id']].name
        recipient_ids = [r['recipient_id'] for r in entry['recipients']]
        if any(all_parties[party_id].is_redlisted for party_id in [entry['from']] + recipient_ids):
            entry['redlisted'] = True
        entry['timestamp'] = str(entry['timestamp'].to_json())
    return {'info': mail_list}


def get_mail_body(character_id, mail_id, current_user=None):
    character = Character.get(character_id)
    character_application_access_check(current_user, character)
    mail_data = character.get_op(
        'get_characters_character_id_mail_mail_id',
        character_id=character_id,
        mail_id=mail_id,
    )
    return mail_data.body
from security import is_admin, is_senior_recruiter, user_admin_access_check
from models import db, Character, ConfigItem, MailTemplate
from exceptions import BadRequestException, ForbiddenException


def get_mail_character():
    config = db.session.query(ConfigItem).filter_by(key='mail_character_id').one_or_none()
    if config is None:
        character = None
    else:
        mail_character_id = int(config.value)
        character = db.session.query(Character).filter_by(id=mail_character_id).one_or_none()
    return character


def get_mail_text(template_name, **kwargs):
    mail_template = MailTemplate.query.get(template_name)
    if mail_template is None:
        raise BadRequestException('Mail template {} does not exist'.format(template_name))
    return mail_template.subject, mail_template.text.format(**kwargs)


def set_mail_character(character, current_user=None):
    user_admin_access_check(current_user)
    config = db.session.query(ConfigItem).filter_by(key='mail_character_id').one_or_none()
    if config is None:
        config = ConfigItem(key='mail_character_id', value=str(character.id))
        db.session.add(config)
    else:
        config.value = str(character.id)
    db.session.commit()


def set_mail_template(name, subject, text, current_user=None):
    user_admin_access_check(current_user)
    template = MailTemplate.query.get(name)
    if template is None:
        template = MailTemplate(name=name, subject=subject, text=text)
        db.session.add(template)
    else:
        template.subject = subject
        template.text = text
    db.session.commit()


def send_mail(to_character_id, template_name, current_user=None, **kwargs):
    if not is_senior_recruiter(current_user) or is_admin(current_user):
        raise ForbiddenException(
            'User {} is not authorized to send mail.'.format(current_user.id)
        )
    subject, text = get_mail_text(template_name, **kwargs)
    mail_character = get_mail_character()
    mail_character.get_op(
        'post_characters_character_id_mail',
        character_id=mail_character.id,
        mail={
            'body': text,
            'subject': subject,
            'recipients': [
                {
                    'recipient_id': to_character_id,
                    'recipient_type': 'character',
                }
            ]
        }
    )
    return {'status': 'ok'}

from security import user_admin_access_check


def set_mail_character(character, current_user=None):
    user_admin_access_check(current_user)


def set_mail_template(name, template, current_user=None):
    user_admin_access_check(current_user)


def send_mail(to_character_id, template_name, current_user=None, **kwargs):
    user_admin_access_check(current_user)

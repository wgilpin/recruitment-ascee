from flask_login import current_user
from security import login_required, user_admin_access_check
from flask_app import app
from flask import request, jsonify
from mail import set_mail_template, get_mail_character_data, get_mail_template
from exceptions import BadRequestException
from login import login_helper


@app.route('/api/mail/set_character')
@login_required
def api_set_mail_character():
    """
    Sends user to ESI to auth a character for sending admin mails.

    Error codes:
        Forbidden (403): If logged in user is not an admin.
    """
    user_admin_access_check(current_user)
    return login_helper('mail')


@app.route('/api/mail/get_character')
@login_required
def api_get_mail_character():
    """
    Retrieves info about the current character used to send mail.

    Example:

        {
            'info': {
                'id': 102830721,
                'name': Mailman Mark,
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not an admin.
    """
    user_admin_access_check(current_user)
    return jsonify(get_mail_character_data(current_user=current_user))


@app.route('/api/mail/template', methods=['PUT'])
@login_required
def api_set_mail_template():
    """
    Sets a template.

    Template can include {name} in parts like 'Congratulations {name}', which
    will be filled using the to-character's name automatically later.

    Args:
        name (str)
        subject (str)
        template (str)

    Returns:
        {'status': 'ok'}

    Error codes:
        Forbidden (403): If logged in user is not an admin.
        Bad request (400): If any arguments are missing.
    """
    name = request.get_json().get('name')
    subject = request.get_json().get('subject')
    template = request.get_json().get('template')
    if name is None:
        raise BadRequestException('name argument is missing.')
    elif template is None:
        raise BadRequestException('template argument is missing.')
    elif subject is None:
        raise BadRequestException('subject argument is missing.')
    else:
        return jsonify(set_mail_template(name, subject=subject, text=template, current_user=current_user))


@app.route('/api/mail/template/<str:name>', methods=['GET'])
@login_required
def api_get_mail_template(name):
    """
    Retrieves a mail template. Returns an empty template if not present.

    Args:
        name (str)

    Returns:
        response

    Example:

        {
            'info': {
                'name': 'accept',
                'subject': 'Congratulations!'
                'text': 'Lorem ipsum dolores sit amet...'
            }
        }

    Error codes:
        Forbidden (403): If logged in user is not an admin.
        Bad request (400): If any arguments are missing.
    """
    if name is None:
        raise BadRequestException('name argument is missing.')
    return jsonify(get_mail_template(name, current_user=current_user))
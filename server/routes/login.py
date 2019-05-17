from flask_login import login_required, current_user, logout_user
from flask import redirect
from flask_app import app
from esi_config import react_app_url
from login import sso


@app.route('/auth/login')
def api_login():
    """
    Redirects user to ESI SSO login.
    """
    return sso.call_sso('login')


@app.route('/auth/logout')
@login_required
def api_logout():
    """
    Logs out the current user.
    """
    logout_user()
    return redirect(react_app_url)


@app.route('/auth/link_alt')
@login_required
def api_link_alt():
    """
    Redirects user to ESI SSO login for the purposes of linking an alt.
    """
    return sso.call_sso('link_alt', user_id=current_user.id)

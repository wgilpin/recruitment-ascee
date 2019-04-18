from security import user_admin_access_check
from models import db, Application, Note
from datetime import datetime, timedelta


def get_recently_invited_applicants(current_user=None):
    user_admin_access_check(current_user)
    result = db.session.query(Application).filter(
        Application.is_invited
    ).join(Note).filter(
        Note.timestamp >= datetime.utcnow() - timedelta(days=90)
    )
    return_data = []
    for application in result:
        last_note_time = sorted([n.timestamp for n in application.notes])[-1]
        return_data.append(
            {
                'user_id': application.user_id,
                'user_name': application.user.name,
                'last_note_time': last_note_time.isoformat(),
                'recruiter_id': application.recruiter_id,
                'recruiter_name': application.recruiter.user.name,
            }
        )
    return_data.sort(key=lambda x: x['last_note_time'], reverse=True)
    return {'info': return_data}

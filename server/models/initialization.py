from models import db, Structure


def init_db():
    db.create_all()
    if not Structure.query.get(2004):
        asset_safety = Structure(
            id=2004, name='Asset Safety', system_id=None, corporation_id=None,
        )
        db.session.add(asset_safety)
        db.session.commit()

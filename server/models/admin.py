from models.database import db

class List(db.model):
    __tablename__ = 'admin_list'
    id = db.Column(db.Integer, primary_key=True)
    kind = db.Column(db.String(10))
    items = db.relationship("ListItem", uselist=True, back_populates="list")

    @classmethod
    def get_by_kind(cls, kind):
        return  db.session.query(cls).filter_by(kind=kind).one()

class ListItem(db.Model):
    __tablename__ = 'admin_list_item'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10))
    list = db.relationship("List", uselist=False, back_populates="items")

from models.database import db
import datetime

list_kinds = [
    'character',
    'type',
    'channel',
    'alliance',
    'corporation',
    'system'
    ]

class List(db.Model):
    __tablename__ = 'admin_list'
    id = db.Column(db.Integer, primary_key=True)
    kind = db.Column(db.String(10))
    items = db.relationship("ListItem", uselist=True, back_populates="list")

    @classmethod
    def get_by_kind(cls, kind):
        return db.session.query(cls).filter_by(kind=kind).one_or_none()

class ListItem(db.Model):
    __tablename__ = 'admin_list_item'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(10))
    list_id = db.Column(db.Integer, db.ForeignKey(List.id))
    list = db.relationship("List", uselist=False, back_populates="items")

list_cache = {}
list_cache_time = datetime.datetime(year=1970, month=1, day=1)
LIST_CACHE_TTL = datetime.timedelta(minutes=10)

def get_redlists():
    lists = {}
    for kind in list_kinds:
        lists[kind] = set()
        this_list = List.get_by_kind(kind)
        if this_list:
            for item in List.get_by_kind(kind).items:
                lists[kind].add(item.id)
    return lists

def check_redlist(esi_id, kind):
    global list_cache
    if datetime.datetime.now() > list_cache_time + LIST_CACHE_TTL:
        list_cache = get_redlists()
    return esi_id in list_cache[kind]

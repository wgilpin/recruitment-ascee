from models.database import db


class ConfigItem(db.Model):
    __tablename__ = 'config_item'
    key = db.Column(db.String, primary_key=True)
    value = db.Column(db.String)

    def __str__(self):
        return '{}: {}'.format(self.key, self.value)

    def __repr__(self):
        return 'ConfigItem(key={!r}, value={!r})'.format(self.key, self.value)


class MailTemplate(db.Model):
    __tablename__ = 'mailtemplate'
    name = db.Column(db.String, primary_key=True)
    subject = db.Column(db.String, nullable=False)
    text = db.Column(db.Text, nullable=False)

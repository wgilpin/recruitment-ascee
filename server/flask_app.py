from flask import Flask

# [START create_app]
app = Flask(__name__)
# [END create_app]
app.secret_key = b'\xc1b\xe2\xfd\xa2\xd4AG}\xfep\x9c*Fq.'

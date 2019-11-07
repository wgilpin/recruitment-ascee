create a Eve ESI application (https://developers.eveonline.com/)

Create Heroku app

Install Heroku CLI app (https://devcenter.heroku.com/articles/heroku-cli)

Install Postgres following the instructions (https://devcenter.heroku.com/articles/heroku-postgresql#local-setup) (NOTE: windows users, make sure to add the "/bin" folder to the path)

Follow the bottom deploy instruction under "Deploy using Heroku Git" (Existing Git repository)

Add Config vars:
 - APP_URL: Should match your domain (E.G. https://recruit-ascee-test.herokuapp.com/)
 - REACT_APP_APP_URL: Should match APP_URL
 - ASCEE_RECRUIT_SERVER_DIR: /app/server
 - CLIENT_ID: Eve ESI application Client ID (https://developers.eveonline.com/)
 - SECRET_KEY: Eve ESI application Secret Key (https://developers.eveonline.com/)
 
    Postgres data, duplicate the heroku tab and go to Overview, click on "Heroku Postgres" under installed addons
Click settings on the new window and then click View Credentials. Take the info to the right of the bolded word shown below

 - POSTGRES_DATABASE: Database
 - POSTGRES_USER: User
 - POSTGRES_PASSWORD: Password
 - POSTGRES_PORT: Port
 
 
Click Open app and Auth

In the heroku Postgres tab, go to "Dataclips"

Create a Dataclip called "Get Characters"
Add the line to the scratch pad
    select * from character
 
save and run


Open up a terminal and type "heroku login" and follow the prompt onscreen

next type "heroku pg:psql -a <appname>" replacing <appname> with the heroku app name that you gave when you created the app

next type

"insert into admin (id) values (<ID>);
insert into recruiter (id, is_senior) values (<ID>, True);"
Replacing both <ID>'s with the ID found on the Dataclip from before (It should have YOUR Eve character name)

Congratulations, you've setup the dev environment
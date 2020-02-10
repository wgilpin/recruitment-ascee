# Running the app

https://ascee-recruit.herokuapp.com/

Login via eve. If you are a recruiter you can stop at the scopes page - no need to give us scopes. Then we can add you as a recruiter.

# The codebase

/server is the node backend

/client/src is the react frontend. Ignore the other files in /client

Getting started:

1. You'll need the app engine datastore keys to run it live, or your own service account on GAE in this project.

2. cd /server

   npm install
   
   python main.py
   
or

3. cd /client

   yarn install
   
   yarn build

The front end url is /app

## Running Front End tests

   cd <Project Root>/client

   yarn test


## How to migrate the db

The migrations folder should already exist, as created by `flask db init`.

To update the migration state, run

python manage.py db migrate

Review the new file created in migrations/versions, and ensure the upgrade steps that were auto-generated are accurate.

Then run

python manage.py db upgrade


## Loading test data

The file `e2e_data.template.py` should be copied locally to `e2e_data.py`. This file is gitignored as it will contain your account refresh tokens which you don't want in the repo!

To get your tokens:
set the environent variable
    `export ASCEE_SHOW_TOKENS=True` (or windows equivalent)
    
run the local server
   in `/server`
   `python main.py`
   
open the app and log in, allowing scopes requested
   `http://localhost:8080/app`
   
in the the lauch terminal look for `TOKEN` and you'll see the character ID and refresh token for the logged in user.

Add these to `e2e_data.py`
Note you should add 3 characters for full testing, one as recruiter, one as applicant, one as admin
Make them different characters.

Once done, stop the server (if running) and run
   in `/server/tests`
   `python e2e_tests.py`
   
This weill start the server with all the test accounts loaded, so you try the roles depending who you log in as via
   `http://localhost:8080/app`
   
## Running on Heroku

1. create a Eve ESI application (https://developers.eveonline.com/)

2. Create Heroku app

3. Install Heroku CLI app (https://devcenter.heroku.com/articles/heroku-cli)

4. Install Postgres following the instructions (https://devcenter.heroku.com/articles/heroku-postgresql#local-setup) (NOTE: windows users, make sure to add the "/bin" folder to the path)

5. Follow the bottom deploy instruction under "Deploy using Heroku Git" (Existing Git repository)

6. Add Config vars:
 * CLIENT_ID: Eve ESI application Client ID (https://developers.eveonline.com/)
 * SECRET_KEY: Eve ESI application Secret Key (https://developers.eveonline.com/)
 * APP_URL: Should match your domain (E.G. https://recruit-ascee-test.herokuapp.com/)
 * REACT_APP_APP_URL:  Should match APP_URL
 * ASCEE_RECRUIT_SERVER_DIR: /app/server
 * AWS_BUCKET, AWS_REGION, AWS_ENDPOINT_URL should contain boto3 info for image upload server
 * AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY should contain boto3 credentials for image upload

6. (Part 2) On the Settings page, make sure heroku/python and heroku/nodejs are
   both enabled as buildpacks. Click the Add buildpack button to add either that
   might be missing.

7. For Postgres data, duplicate the heroku tab and go to Overview, click on "Heroku Postgres" under installed addons
Click settings on the new window and then click View Credentials. Take the info to the right of the bolded word shown below

 * POSTGRES_DATABASE: Database
 * POSTGRES_USER: User
 * POSTGRES_PASSWORD: Password
 * POSTGRES_PORT: Port
 
8. Click Open app and Auth

9. In the heroku Postgres tab, go to "Dataclips"

10. Create a Dataclip called "Get Characters"
Add the line to the scratch pad:

    ```
    select * from character
    ```
 
11. save and run


12. Open up a terminal and type "heroku login" and follow the prompt onscreen

13. next type "heroku pg:psql -a appname" replacing appname with the heroku app name that you gave when you created the app

14. next type
```insert into admin (id) values (ID);
insert into recruiter (id, is_senior) values (ID, True);
```

Replacing both ID's with the ID found on the Dataclip from before (It should have YOUR Eve character name)

## Wireframes

![Landing Wireframe](https://github.com/wgilpin/recruitment-ascee/blob/master/docs/Landing%20Wireframe.png)
![Applicant Wireframe](https://github.com/wgilpin/recruitment-ascee/blob/master/docs/Applicant_Wireframe.png)
![Recruiter Wireframe](https://github.com/wgilpin/recruitment-ascee/blob/master/docs/Recruiter_Wireframe.png)
![Admin Wireframe](https://github.com/wgilpin/recruitment-ascee/blob/master/docs/Admin%20Wireframe.png)

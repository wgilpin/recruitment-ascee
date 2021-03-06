import os

if os.environ.get('CURRENT_ENV', '') == 'heroku':
    client_id = '37de4bba039744c0a4d59cc15c9748c2'
    secret_key = 'O0q1KdspI0QRNlpX3nlSgXIGn0WJ9DOxxqj1bHrv'
    app_url = 'http://ascee-recruit.herokuapp.com/'
    database_url = os.environ['DATABASE_URL']
    aws_bucket_name = 'ascee-recruit'
    aws_region_name='ams3'
    aws_endpoint_url='https://ams3.digitaloceanspaces.com'
else:
    client_id = os.environ['CLIENT_ID']
    secret_key = os.environ['SECRET_KEY']
    app_url = os.environ['APP_URL']
    postgres_database = os.environ['POSTGRES_DATABASE']
    postgres_user = os.environ['POSTGRES_USER']
    postgres_password = os.environ['POSTGRES_PASSWORD']
    postgres_port = os.environ['POSTGRES_PORT']
    database_url = os.environ['DATABASE_URL']
    aws_bucket_name = 'ascendancerecruitment'
    aws_region_name='fra1'
    aws_endpoint_url='https://fra1.digitaloceanspaces.com'


scopes = """publicData esi-calendar.read_calendar_events.v1 esi-location.read_location.v1 esi-location.read_ship_type.v1 esi-mail.read_mail.v1 esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1 esi-wallet.read_character_wallet.v1 esi-search.search_structures.v1 esi-clones.read_clones.v1 esi-characters.read_contacts.v1 esi-universe.read_structures.v1 esi-bookmarks.read_character_bookmarks.v1 esi-killmails.read_killmails.v1 esi-corporations.read_corporation_membership.v1 esi-assets.read_assets.v1 esi-planets.manage_planets.v1 esi-fleets.read_fleet.v1 esi-fittings.read_fittings.v1 esi-markets.structure_markets.v1 esi-corporations.read_structures.v1 esi-characters.read_loyalty.v1 esi-characters.read_opportunities.v1 esi-characters.read_chat_channels.v1 esi-characters.read_medals.v1 esi-characters.read_standings.v1 esi-characters.read_agents_research.v1 esi-industry.read_character_jobs.v1 esi-markets.read_character_orders.v1 esi-characters.read_blueprints.v1 esi-characters.read_corporation_roles.v1 esi-location.read_online.v1 esi-contracts.read_character_contracts.v1 esi-clones.read_implants.v1 esi-characters.read_fatigue.v1 esi-killmails.read_corporation_killmails.v1 esi-corporations.track_members.v1 esi-wallet.read_corporation_wallets.v1 esi-characters.read_notifications.v1 esi-corporations.read_divisions.v1 esi-corporations.read_contacts.v1 esi-assets.read_corporation_assets.v1 esi-corporations.read_titles.v1 esi-corporations.read_blueprints.v1 esi-bookmarks.read_corporation_bookmarks.v1 esi-contracts.read_corporation_contracts.v1 esi-corporations.read_standings.v1 esi-corporations.read_starbases.v1 esi-industry.read_corporation_jobs.v1 esi-markets.read_corporation_orders.v1 esi-corporations.read_container_logs.v1 esi-industry.read_character_mining.v1 esi-industry.read_corporation_mining.v1 esi-planets.read_customs_offices.v1 esi-corporations.read_facilities.v1 esi-corporations.read_medals.v1 esi-characters.read_titles.v1 esi-alliances.read_contacts.v1 esi-characters.read_fw_stats.v1 esi-corporations.read_fw_stats.v1 esi-characterstats.read.v1"""

aws_signature_version='s3'
send_mail_scope = 'esi-mail.send_mail.v1'
react_app_url = app_url + 'app'
applicant_url = react_app_url + '/apply'
recruiter_url = react_app_url + '/recruiter'
admin_url = react_app_url + '/admin'
wrong_character_url = react_app_url + '/wrong_character'
callback_url = app_url + 'auth/oauth_callback'
client_name = 'ascee-recruit'
login_url = 'https://login.eveonline.com/oauth/authorize/'
rejection_url = 'http://rejectionline.com/'

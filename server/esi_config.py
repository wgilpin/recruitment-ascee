import os

if os.environ.get('CURRENT_ENV', '') == 'heroku':
    client_id = '37de4bba039744c0a4d59cc15c9748c2'
    secret_key = 'O0q1KdspI0QRNlpX3nlSgXIGn0WJ9DOxxqj1bHrv'
    app_url = 'http://ascee-recruit.herokuapp.com/'
    databae_url = os.environ('DATABASE_URL')
else:
    client_id = 'd42741ceaf7140049db95ec65dda5742'
    secret_key = 'XkkgTu89W1diw2OjrwGlav5T2koud7TPQoePbjoE'
    app_url = 'http://localhost:8080/'
    database_url = 'postgres://cituvktnwbfvha:b6b6c2b90c91f18c62285124668204a1d55c062c941b87ddf21ee65840ed0c68@ec2-54-228-252-67.eu-west-1.compute.amazonaws.com:5432/dbplq7f0tll58f'
react_app_url = app_url + 'app'
applicant_url = react_app_url + '/apply'
recruiter_url = react_app_url + '/recruiter'
admin_url = react_app_url + '/admin'
callback_url = app_url + 'auth/oauth_callback'
client_name = 'ascee-recruit'
login_url = 'https://login.eveonline.com/oauth/authorize/'
scopes = """publicData esi-calendar.respond_calendar_events.v1 esi-calendar.read_calendar_events.v1 esi-location.read_location.v1 esi-location.read_ship_type.v1 esi-mail.organize_mail.v1 esi-mail.read_mail.v1 esi-mail.send_mail.v1 esi-skills.read_skills.v1 esi-skills.read_skillqueue.v1 esi-wallet.read_character_wallet.v1 esi-search.search_structures.v1 esi-clones.read_clones.v1 esi-characters.read_contacts.v1 esi-universe.read_structures.v1 esi-bookmarks.read_character_bookmarks.v1 esi-killmails.read_killmails.v1 esi-corporations.read_corporation_membership.v1 esi-assets.read_assets.v1 esi-planets.manage_planets.v1 esi-fleets.read_fleet.v1 esi-fleets.write_fleet.v1 esi-ui.open_window.v1 esi-ui.write_waypoint.v1 esi-characters.write_contacts.v1 esi-fittings.read_fittings.v1 esi-fittings.write_fittings.v1 esi-markets.structure_markets.v1 esi-corporations.read_structures.v1 esi-characters.read_loyalty.v1 esi-characters.read_opportunities.v1 esi-characters.read_chat_channels.v1 esi-characters.read_medals.v1 esi-characters.read_standings.v1 esi-characters.read_agents_research.v1 esi-industry.read_character_jobs.v1 esi-markets.read_character_orders.v1 esi-characters.read_blueprints.v1 esi-characters.read_corporation_roles.v1 esi-location.read_online.v1 esi-contracts.read_character_contracts.v1 esi-clones.read_implants.v1 esi-characters.read_fatigue.v1 esi-killmails.read_corporation_killmails.v1 esi-corporations.track_members.v1 esi-wallet.read_corporation_wallets.v1 esi-characters.read_notifications.v1 esi-corporations.read_divisions.v1 esi-corporations.read_contacts.v1 esi-assets.read_corporation_assets.v1 esi-corporations.read_titles.v1 esi-corporations.read_blueprints.v1 esi-bookmarks.read_corporation_bookmarks.v1 esi-contracts.read_corporation_contracts.v1 esi-corporations.read_standings.v1 esi-corporations.read_starbases.v1 esi-industry.read_corporation_jobs.v1 esi-markets.read_corporation_orders.v1 esi-corporations.read_container_logs.v1 esi-industry.read_character_mining.v1 esi-industry.read_corporation_mining.v1 esi-planets.read_customs_offices.v1 esi-corporations.read_facilities.v1 esi-corporations.read_medals.v1 esi-characters.read_titles.v1 esi-alliances.read_contacts.v1 esi-characters.read_fw_stats.v1 esi-corporations.read_fw_stats.v1 esi-characterstats.read.v1"""
rejection_url = 'http://rejectionline.com/'

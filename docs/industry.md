# Industry API

`/api/character/<char_id>/industry`


## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## ESI return

get_characters_character_id_industry_jobs

`activity_id` (integer): Job activity ID ,

`blueprint_id` (integer): blueprint_id integer ,

`blueprint_location_id` (integer): Location ID of the location from which the blueprint was installed. Normally a station ID, but can also be an asset (e.g. container) or corporation facility ,

`blueprint_type_id` (integer): blueprint_type_id integer ,

`completed_character_id` (integer, optional): ID of the character which completed this job ,

`completed_date` (string, optional): Date and time when this job was completed ,

`cost` (number, optional): The sume of job installation fee and industry facility tax ,

`duration` (integer): Job duration in seconds ,

`end_date` (string): Date and time when this job finished ,

`facility_id` (integer): ID of the facility where this job is running ,

`installer_id` (integer): ID of the character which installed this job ,

`job_id` (integer): Unique job ID ,

`licensed_runs` (integer, optional): Number of runs blueprint is licensed for ,

`output_location_id` (integer): Location ID of the location to which the output of the job will be delivered. Normally a station ID, but can also be a corporation facility ,

`pause_date` (string, optional): Date and time when this job was paused (i.e. time when the facility where this job was installed went offline) ,

`probability` (number, optional): Chance of success for invention ,

`product_type_id` (integer, optional): Type ID of product (manufactured, copied or invented) ,

`runs` (integer): Number of runs for a manufacturing job, or number of copies to make for a blueprint copy ,

`start_date` (string): Date and time when this job started ,

`station_id` (integer): ID of the station where industry facility is located ,

`status` (string): status string = ['active', 'cancelled', 'delivered', 'paused', 'ready', 'reverted'],

`successful_runs` (integer, optional): Number of successful runs for this job. Equal to runs unless this is an invention job

## Sample Output

### Enrichment

'''
  blueprint_type_name
  output_location_name
  station_name
'''

```json
{
  "info":
  [
    {
      "blueprint_type_name": "Hel",
      "blueprint_type_id": 2047,
      "cost": 118.01,
      "duration": 548,
      "end_date": "2014-07-19T15:56:14Z",
      "licensed_runs": 200,
      "output_location_id": 60006382,
      "output_location_name": 60006382,
      "runs": 1,
      "start_date": "2014-07-19T15:47:06Z",
      "station_id": 60006382,
      "station_name": "Jita IV-4 Calda...",
      "status": "active"
    }
  ]
}
```
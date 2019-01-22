# Skills API

## Request Params

`userId` {int} 

    ESI id for alt

`token` {string}

    Access Token

## Sample Output

### Enrichment

Added `group_name` and `skill_name` to skill list

Added `group_name` and `skill_name` to queue


```
{
  "info": {
    "skills": [
      {
        "skill_id": { "groupName": "Gunnery", "name": "Gunnery" },
        "active_skill_level": 5,
        "skillpoints_in_skill": 256000
      },
      {
        "skill_id": { "groupName": "Gunnery", "name": "Small Hybrid Turret" },
        "active_skill_level": 5,
        "skillpoints_in_skill": 256000
      },
      {
        "skill_id": {
          "groupName": "Gunnery",
          "name": "Small Projectile Turret"
        },
        "active_skill_level": 5,
        "skillpoints_in_skill": 256000
      },
      {
        "skill_id": { "groupName": "Gunnery", "name": "Small Energy Turret" },
        "active_skill_level": 5,
        "skillpoints_in_skill": 256000
      },
      {
        "skill_id": { "groupName": "Gunnery", "name": "Medium Hybrid Turret" },
        "active_skill_level": 5,
        "skillpoints_in_skill": 768000
      },
      {
        "skill_id": {
          "groupName": "Gunnery",
          "name": "Medium Projectile Turret"
        },
        "active_skill_level": 5,
        "skillpoints_in_skill": 768000
      }
    ],
    "queue": [
      {
        "finish_date": "2019-02-24T16:38:32Z",
        "finished_level": 5,
        "level_end_sp": 3072000,
        "level_start_sp": 543059,
        "queue_position": 0,
        "skill_id": { "name": "Heavy Fighters", "id": 32339 },
        "start_date": "2019-01-11T21:59:48Z",
        "training_start_sp": 1086280
      },
      {
        "finish_date": "2019-03-30T19:00:02Z",
        "finished_level": 5,
        "level_end_sp": 3584000,
        "level_start_sp": 633568,
        "queue_position": 1,
        "skill_id": { "name": "Minmatar Carrier", "id": 24314 },
        "start_date": "2019-02-24T16:38:32Z",
        "training_start_sp": 2110955
      },
      {
        "finish_date": "2019-04-22T16:00:12Z",
        "finished_level": 5,
        "level_end_sp": 1280000,
        "level_start_sp": 226275,
        "queue_position": 2,
        "skill_id": { "name": "Minmatar Cruiser", "id": 3333 },
        "start_date": "2019-03-30T19:00:02Z",
        "training_start_sp": 291795
      }
    ]
  }
}

```

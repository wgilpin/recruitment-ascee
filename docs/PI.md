# PI API

`/api/character/<char_id>/planetary_interaction`

## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## ESI return

get_characters_character_id_planets

```
last_update (string): last_update string ,
num_pins (integer): num_pins integer ,
owner_id (integer): owner_id integer ,
planet_id (integer): planet_id integer ,
planet_type (string): planet_type string = ['temperate', 'barren', 'oceanic', 'ice', 'gas', 'lava', 'storm', 'plasma'],
solar_system_id (integer): solar_system_id integer ,
upgrade_level (integer): upgrade_level integer
```

## Sample Output

### Enrichment

`solar_system_name`
`region_name`
`region_id`

```json
{
  "info":
  [
    {
      "last_update": "2016-11-28T16:42:51Z",
      "num_pins": 1,
      "planet_type": "plasma",
      "solar_system_id": 30000379,
      "solar_system_name": "Deltole",
      "upgrade_level": 0
    },
    {
      "last_update": "2016-11-28T16:41:54Z",
      "num_pins": 1,
      "planet_type": "barren",
      "solar_system_id": 30000379,
      "solar_system_name": "Deltole",
      "upgrade_level": 0
    }
  ]
}
```
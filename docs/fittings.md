# Fittings API

`/api/character/<char_id>/fittings`

## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## Sample Output

### Enrichment

`ship_type_name` from `ship_type_id`

in items[]

`type_name` from `type_id`

```json
{
  "info":
  [
    {
      "description": "Awesome Vindi fitting",
      "fitting_id": 1,
      "items": [
        {
          "flag": 12,
          "quantity": 1,
          "type_id": 1234
        }
      ],
      "name": "Best Vindicator",
      "ship_type_id": 123
    }
  ]
}
```
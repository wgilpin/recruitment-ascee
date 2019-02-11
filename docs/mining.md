# Mining API

`/api/character/<char_id>/mining`


## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## ESI return

```
date (string): date string ,
quantity (integer): quantity integer ,
solar_system_id (integer): solar_system_id integer ,
type_id (integer): type_id integer
```

## Sample Output

### Enrichment

`solar_system_name` from `solar_system_id`
`type_name` from `type_id`
`price` (per unit)

```json
{
  "info":
  [
    {
      "date": "2017-09-19",
      "quantity": 7004,
      "solar_system_id": 30003707,
      "solar_system_name": "Jita",
      "type_id": 17471,
      "type_name": "Mercoxit",
      "price": 1234.50,
    },
  ]
}
```
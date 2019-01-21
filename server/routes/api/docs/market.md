# Market API

## Request Params

`userId` {int} 

    ESI id for alt

`token` {string}

    Access Token

## Sample Output

### Enrichment

This is an amalgamation of both current orders and historical orders.

API adds
* sign on `price` 
  + buy order -ve
  + sell order +ve 
  + from `is_buy_order`
* `location`
* `region`
* `type`


```
{
  "info": [
    {
      "duration": 0,
      "escrow": 0,
      "is_buy_order": true,
      "is_corporation": false,
      "issued": "2018-10-30T16:12:19Z",
      "location_id": 1022734985679,
      "min_volume": 1,
      "order_id": 5283556483,
      "price": -117066898,
      "range": "station",
      "region_id": 10000060,
      "state": "expired",
      "type_id": 17889,
      "volume_remain": 0,
      "volume_total": 104711,
      "type": "Hydrogen Isotopes",
      "location": "1DQ1-A - 1-st Thetastar of Dickbutt",
      "region": "Delve"
    },
    {
      "duration": 0,
      "escrow": 0,
      "is_buy_order": true,
      "is_corporation": false,
      "issued": "2018-10-30T19:00:17Z",
      "location_id": 1022734985679,
      "min_volume": 1,
      "order_id": 5283666237,
      "price": -55997500,
      "range": "station",
      "region_id": 10000060,
      "state": "expired",
      "type_id": 17889,
      "volume_remain": 0,
      "volume_total": 50000,
      "type": "Hydrogen Isotopes",
      "location": "1DQ1-A - 1-st Thetastar of Dickbutt",
      "region": "Delve"
    },
    {
      "duration": 3,
      "is_corporation": false,
      "issued": "2018-12-03T17:48:32Z",
      "location_id": 1022734985679,
      "order_id": 5309101244,
      "price": 740312999,
      "range": "region",
      "region_id": 10000060,
      "state": "expired",
      "type_id": 40520,
      "volume_remain": 0,
      "volume_total": 1,
      "type": "Large Skill Injector",
      "location": "1DQ1-A - 1-st Thetastar of Dickbutt",
      "region": "Delve"
    },
    {
      "duration": 0,
      "escrow": 0,
      "is_buy_order": true,
      "is_corporation": false,
      "issued": "2018-12-03T17:50:55Z",
      "location_id": 1022734985679,
      "min_volume": 1,
      "order_id": 5309102637,
      "price": -39499.97,
      "range": "station",
      "region_id": 10000060,
      "state": "expired",
      "type_id": 23707,
      "volume_remain": 0,
      "volume_total": 1,
      "type": "Hornet EC-300",
      "location": "1DQ1-A - 1-st Thetastar of Dickbutt",
      "region": "Delve"
    },
    {
      "duration": 3,
      "is_corporation": false,
      "issued": "2018-12-10T20:47:12Z",
      "location_id": 1022734985679,
      "order_id": 5314007417,
      "price": 128500000.09,
      "range": "region",
      "region_id": 10000060,
      "state": "expired",
      "type_id": 19421,
      "volume_remain": 0,
      "volume_total": 1,
      "type": "23rd Tier Overseer's Personal Effects",
      "location": "1DQ1-A - 1-st Thetastar of Dickbutt",
      "region": "Delve"
    }
  ]
}

```
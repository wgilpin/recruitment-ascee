# Wallet API

## Request Params

`userId` {int}

    ESI id for alt

`token` {string}

    Access Token

## Sample Output

### Enrichment

first_party_id is enriched with `name`

second_party_id is enriched with `name`

```json
{
  "info": [
    {
      "amount": 500000000,
      "balance": 8489237173.4526,
      "date": "2019-01-12T10:51:51Z",
      "description": "Semirhage Boan deposited cash into Billy Antollarenti's account",
      "first_party_id": {
        "type": "Character",
        "birthday": "2014-02-16T15:07:36Z",
        "description": "",
        "gender": "female",
        "corporation_id": 98409330,
        "security_status": 5.005929386162036,
        "race_id": 2,
        "name": "Semirhage Boan",
        "id": 94399527,
        "bloodline_id": 14,
        "alliance_id": 1354830081,
        "ancestry_id": 41
      },
      "id": 16359097918,
      "ref_type": "player_donation",
      "second_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      }
    },
    {
      "amount": -10300,
      "balance": 7989237173.4526,
      "context_id": 1029242485167,
      "context_id_type": "structure_id",
      "date": "2019-01-11T22:12:35Z",
      "description": "Fee for activating a Upwell Jumpgate paid from Billy Antollarenti to GoonWaffe",
      "first_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      },
      "id": 16357335194,
      "ref_type": "structure_gate_jump",
      "second_party_id": {
        "type": "CharacterOrCorp",
        "war_eligible": true,
        "description": "FNLN: i killed my moms and my god. j/k. god isn't real and is a human concept. do babys ever think of god? no. because hes fake. baby geniuses was true... i guess.<br>dintlu: babies they cannot talk. ",
        "url": "",
        "ceo_id": 443630591,
        "home_station_id": 60011017,
        "creator_id": 1319959648,
        "name": "GoonWaffe",
        "member_count": 1677,
        "id": "667531913",
        "ticker": "GEWNS",
        "tax_rate": 0.1,
        "date_founded": "2006-03-07T01:18:00Z",
        "shares": 100000,
        "alliance_id": 1354830081
      }
    },
    {
      "amount": -900000,
      "balance": 7989247473.4526,
      "date": "2019-01-11T21:59:47Z",
      "description": "Fee for activating a Jump Clone paid from Billy Antollarenti to The Sanctuary",
      "first_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      },
      "id": 16357296332,
      "ref_type": "jump_clone_activation_fee",
      "second_party_id": {
        "ceo_id": 3004529,
        "home_station_id": 60014056,
        "creator_id": 1,
        "name": "The Sanctuary",
        "type": "CharacterOrCorp",
        "member_count": 8,
        "id": "1000159",
        "tax_rate": 0,
        "ticker": "SAN",
        "description": "The Sanctuary is the center of the science research the Sisters are undertaking on the EVE gate. It also acts as a typical refuge haven as all other SOE stations, but this activity is secondary to its",
        "shares": 98610171
      }
    },
    {
      "amount": -900000,
      "balance": 7990147473.4526,
      "date": "2019-01-11T21:58:41Z",
      "description": "Fee for installing a Jump Clone paid from Billy Antollarenti to The Sanctuary",
      "first_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      },
      "id": 16357293046,
      "ref_type": "jump_clone_installation_fee",
      "second_party_id": {
        "ceo_id": 3004529,
        "home_station_id": 60014056,
        "creator_id": 1,
        "name": "The Sanctuary",
        "type": "CharacterOrCorp",
        "member_count": 8,
        "id": "1000159",
        "tax_rate": 0,
        "ticker": "SAN",
        "description": "The Sanctuary is the center of the science research the Sisters are undertaking on the EVE gate. It also acts as a typical refuge haven as all other SOE stations, but this activity is secondary to its",
        "shares": 98610171
      }
    },
    {
      "amount": -2347967.4,
      "balance": 7991047473.4526,
      "context_id": 1029617788417,
      "context_id_type": "eve_system",
      "date": "2019-01-11T21:35:05Z",
      "description": "Insurance paid by Billy Antollarenti to Secure Commerce Commission for ship shaz (Insurance RefID:1029617788417",
      "first_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      },
      "id": 16357217735,
      "ref_type": "insurance",
      "second_party_id": {
        "ceo_id": 3004045,
        "home_station_id": 60012736,
        "creator_id": 1,
        "name": "Secure Commerce Commission",
        "type": "CharacterOrCorp",
        "member_count": 13,
        "id": "1000132",
        "tax_rate": 0,
        "ticker": "SCC",
        "description": "The SCC is responsible for regulating and monitoring all trade transactions that take place on space stations. It has agents on all stations that record the transactions and they also offer courier an",
        "shares": 100000000
      }
    },
    {
      "amount": -179200,
      "balance": 7993395440.8526,
      "context_id": 5035386497,
      "context_id_type": "market_transaction_id",
      "date": "2019-01-11T21:34:26Z",
      "description": "Market escrow release",
      "first_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      },
      "id": 16357215807,
      "ref_type": "market_escrow",
      "second_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      }
    },
    {
      "amount": -1999998.98,
      "balance": 7993574640.8526,
      "context_id": 5035386247,
      "context_id_type": "market_transaction_id",
      "date": "2019-01-11T21:34:00Z",
      "description": "Market escrow release",
      "first_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      },
      "id": 16357214559,
      "ref_type": "market_escrow",
      "second_party_id": {
        "bloodline_id": 7,
        "alliance_id": 1354830081,
        "ancestry_id": 15,
        "type": "Character",
        "birthday": "2013-01-26T15:21:05Z",
        "description": "",
        "gender": "male",
        "corporation_id": 98409330,
        "security_status": 4.754919224439139,
        "race_id": 8,
        "name": "Billy Antollarenti",
        "id": 92900739
      }
    }
  ]
}
```
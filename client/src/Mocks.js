/* eslint-disable no-useless-escape */

export default class Mocks {
  static mockLink = {
    "93215544":{
      ID: 94443335,
      type: 'character',
      name: 'Runar Elshenar',
      description: "lkdsijhf lsdkufhj wloisufghc owelieuufefgiuwh wloiedufh ",
      corporation_id: {
        ID: 98409330,
        type: 'corporation',
        name: 'Ascendance',
        ticker: 'ASCEE',
      },
      alliance_id: {
        ID: 1354830081,
        type: 'alliance',
        name: 'Goonswarm Federation',
        corporation_id: '1344654522',
        ticker: 'CONDI',
      }
    },
    "299590276":{
      ID: 299590276,
      type: 'character',
      name: 'Tyler Caderu',
      description: "lkdsijhf lsdkufhj wloisufghc owelieuufefgiuwh wloiedufh ",
      corporation_id: {
        ID: 98409330,
        type: 'corporation',
        name: 'Ascendance',
        ticker: 'ASCEE',
      },
      alliance_id: {
        ID: 1354830081,
        type: 'alliance',
        name: 'Goonswarm Federation',
        corporation_id: '1344654522',
        ticker: 'CONDI',
      }
    },
    "95685518":{
      ID: 95685518,
      type: 'character',
      name: 'Major Sniper',
      description: "lkdsijhf lsdkufhj wloisufghc owelieuufefgiuwh wloiedufh ",
      corporation_id: {
        ID: 98409330,
        type: 'corporation',
        name: 'Ascendance',
        ticker: 'ASCEE',
      },
      alliance_id: {
        ID: 1354830081,
        type: 'alliance',
        name: 'Goonswarm Federation',
        corporation_id: '1344654522',
        ticker: 'CONDI',
      }
    },
    "30004759":{
      solarSystemID: 30004759,
      solarSystemName: '1DQ1-A',
      regionName: 'Delve',
    },
  };
  static mockMailBody = `"\u003Cfont size=\"12\" color=\"#bfffffff\"\u003EThank you for asking that question rather broadly. While we dont normally reply to all (i got your mail apologising and its all good) its a great question. \u003Cbr\u003E\u003Cbr\u003EThese guys we mail you about, are all scamming in 1DQ. Because normally we dont ever goon fuck our own members, we kinda take it for granted that all the contracts are legit in our home system. Recently a few guys have put neuts in there and are scamming our Goons by putting in contracts that are bad and amount to scamming to catch our unaware members. We just add their names so you can BLOCK them and hence you dont accidentally accept their contracts.\u003Cbr\u003E\u003Cbr\u003EPlease dont ever reply all or send corp mails.\u003Cbr\u003E\u003Cbr\u003E--------------------------------\u003Cbr\u003ERe: Another 1DQ scammer\u003Cbr\u003EFrom: \u003C\/font\u003E\u003Cfont size=\"12\" color=\"#ffffa600\"\u003E\u003Ca href=\"showinfo:1377\/\/93215544\"\u003EVictoria Udinof\u003C\/a\u003E\u003Cbr\u003E\u003C\/font\u003E\u003Cfont size=\"12\" color=\"#bfffffff\"\u003ESent: 2018.10.23 21:21\u003Cbr\u003ETo: Ascendance, \u003C\/font\u003E\u003Cfont size=\"12\" color=\"#ffffa600\"\u003E\u003Ca href=\"showinfo:1377\/\/299590276\"\u003EMajor Sniper\u003C\/a\u003E\u003C\/font\u003E\u003Cfont size=\"12\" color=\"#bfffffff\"\u003E,  \u003Cbr\u003E\u003Cbr\u003EThanks for the heads up, but I am not sure what it is we need to watch out for? Could you clarify?\u003Cbr\u003E\u003Cbr\u003EThanks.\u003Cbr\u003E\u003Cbr\u003E--------------------------------\u003Cbr\u003EAnother 1DQ scammer\u003Cbr\u003EFrom: \u003C\/font\u003E\u003Cfont size=\"12\" color=\"#ffffa600\"\u003E\u003Ca href=\"showinfo:1377\/\/299590276\"\u003EMajor Sniper\u003C\/a\u003E\u003Cbr\u003E\u003C\/font\u003E\u003Cfont size=\"12\" color=\"#bfffffff\"\u003ESent: 2018.10.17 13:54\u003Cbr\u003ETo: Ascendance, \u003Cbr\u003E\u003Cbr\u003EPlease block this idiot too  \u003C\/font\u003E\u003Cfont size=\"12\" color=\"#ffffa600\"\u003E\u003Ca href=\"showinfo:1373\/\/95685518\"\u003ETyler Caderu\u003C\/a\u003E\u003C\/font\u003E\u003Cfont size=\"12\" color=\"#bfffffff\"\u003E scamming in  \u003C\/font\u003E\u003Cfont size=\"12\" color=\"#ffffa600\"\u003E\u003Ca href=\"showinfo:5\/\/30004759\"\u003E1DQ1-A\u003C\/a\u003E\u003C\/font\u003E\u003Cfont size=\"12\" color=\"#bfffffff\"\u003E \u003Cbr\u003E\u003Cbr\u003EREAD YOUR CONTRACTS ALWAYS\u003C\/font\u003E"`;
  static mockSkills = {
    blacklist: [],
    queue:
      [
        {
          finish_date: "2018-10-15T20:31:02Z",
          finished_level: 4,
          level_end_sp: 51200,
          level_start_sp: 9051,
          queue_position: 2,
          skill_id:
          {
            standing: 0,
            id: 43702,
            type_id: 43702,
            name: "Ice Harvesting Drone Operation",
            description: "Skill at controlling ice harvesting drones. 5% reduction in ice harvesting drone cycle time per level.",
            multiplier: 2,
            groupName: "Drones",
            primaryAttribute: "Memory",
            secondaryAttribute: "Perception",
          },
          start_date: "2018-10-10T22:23:14Z",
          training_start_sp: 9051,
        },
        {
          finish_date: "2018-10-25T20:31:02Z",
          finished_level: 5,
          level_end_sp: 512000,
          level_start_sp: 90510,
          queue_position: 3,
          skill_id:
          {
            standing: 0,
            id: 43702,
            type_id: 43702,
            name: "Ice Harvesting Drone Operation",
            description: "Skill at controlling ice harvesting drones. 5% reduction in ice harvesting drone cycle time per level.",
            multiplier: 2,
            groupName: "Drones",
            primaryAttribute: "Memory",
            secondaryAttribute: "Perception",
          },
          start_date: "2018-10-15T22:23:14Z",
          training_start_sp: 90510,
        }
      ],
    skills:
    {
      "22536": {
        active_skill_level: 5,
        skill_id:
        {
          standing: 0,
          id: 22536,
          type_id: 22536,
          name: "Mining Foreman",
          description: "Basic proficiency at boosting the mining capabilities of allied ships. Grants a 10% bonus to the duration of Mining Foreman Burst effects per level.",
          multiplier: 2,
          groupName: "Fleet Support",
          primaryAttribute: "Charisma",
          secondaryAttribute: "Willpower",
        },
        skillpoints_in_skill: 512000,
        trained_skill_level: 5,
      },
      "22541":
      {
        active_skill_level: 4,
        skill_id:
        {
          standing: 0,
          id: 22541,
          type_id: 22541,
          name: "Mining Drone Specialization",
          description: "Advanced proficiency at controlling mining drones. 2% bonus to the mining yield and max velocity of drones requiring Mining Drone Specialization per level.",
          multiplier: 5,
          groupName: "Drones",
          primaryAttribute: "Memory",
          secondaryAttribute: "Perception",
        },
        skillpoints_in_skill: 505410,
        trained_skill_level: 4,
      },
      "43702":
      {
        active_skill_level: 4,
        skill_id:
        {
          standing: 0,
          id: 43702,
          type_id: 43702,
          name: "Ice Harvesting Drone Operation",
          description: "Skill at controlling ice harvesting drones. 5% reduction in ice harvesting drone cycle time per level.",
          multiplier: 2,
          groupName: "Drones",
          primaryAttribute: "Memory",
          secondaryAttribute: "Perception",
        },
        skillpoints_in_skill: 90510,
        trained_skill_level: 4,
      }
    }
  };

  static mockMail = {
    blacklist: [],
    info:
      [
        {
          from: {
            standing: 0,
            name: "Neni",
            id: 133895430,
          },

          is_read: 1,
          mail_id: 373117004,
          recipient_id: {
            standing: 0,
            name: "Ascendance",
            id: 98409330,
          },

          recipient_type: "corporation",
          subject: "Reminder: Forum usage and to anyone that has issues with :effort:",
          timestamp: "2018-10-17T14:25:00Z",
        },
        {
          from: {
            standing: 0,
            name: "Major Sniper 1",
            id: 299590276,
          },

          is_read: 1,
          mail_id: 373116726,
          recipient_id:
          {
            standing: 0,
            name: "Ascendance",
            id: 98409330,
          },
          recipient_type: "corporation",
          subject: "Another 1DQ scammer",
          timestamp: "2018-10-17T13:54:00Z",
        },
        {
          from:
          {
            standing: 0,
            name: "Major Sniper 2",
            id: 299590276,
          },
          is_read: 1,
          mail_id: 373112421,
          recipient_id:
          {
            standing: 0,
            name: "Ascendance",
            id: 98409330,
          },
          recipient_type: "corporation",
          subject: "Heads up",
          timestamp: "2018-10-17T01:33:00Z",
        },
      ]
  };

  static mockWallet = {
    "blacklist": [],
    "info": [
      {
        "amount": -500000000,
        "balance": 13072213.2106,
        "date": "2018-10-13T19:58:18Z",
        "description": "martijn dammer deposited cash into youdontknow me's account",
        "first_party_id": {
          "standing": "0",
          "name": "martijn dammer",
          "id": 2113085333,
        },
        "id": 16038171070,
        "ref_type": "player_donation",
        "second_party_id": {
          "standing": "0",
          "name": "youdontknow me",
          "id": 2113171022,
        }
      },
      {
        "amount": -289799403.94,
        "balance": 513072213.2106,
        "context_id": 4975120045,
        "context_id_type": "market_transaction_id",
        "date": "2018-10-13T19:53:23Z",
        "description": "Market escrow release",
        "first_party_id": {
          "standing": "0",
          "name": "martijn dammer",
          "id": 2113085333,
        },
        "id": 16038154261,
        "ref_type": "market_escrow",
        "second_party_id": {
          "standing": "0",
          "name": "martijn dammer",
          "id": 2113085333,
        }
      },
    ]
  };

  static mockBookmarks = {
    blacklist: [],
    info:
    {
      "3785181":
      {
        folder_id: "3785181",
        name: "MTU's",
      },

      "3785192":
      {
        folder_id: "3785192",
        name: "Cargo",
        inside:
        {
          "1140313571":
          {
            bookmark_id: "1140313571",
            created: "2018-01-12T13:46:21Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785192",
            item:
            {
              item_id: "1021841317822",
              type_id: "35832",
              typeName: "Astrahus",
              description: `As the entry-level product in the Upwell Consortium's Citadel range of space stations, the Astrahus has been designed as an economical option for medium-scale operations in space, such as serving as a base of operations for a small- to medium-sized corporation, or as an outpost for larger corporations or even small alliances.

  The Astrahus has been built with new spaceship tethering technology as standard, and will happily accommodate ships under capital size, and even freighter-class hulls, in its internal docking bays. The Astrahus can be configured using Upwell's Standup brand service and structure modules so as to serve the specific needs of the structure operator. Further adjustment of the hardware of the Astrahus can be achieved by installed Standup M-Set rigs to optimize the specific role of the citadel.`,
              standing: 0,
            },

            label: "4K-TRB - Jump Freighter Piloting College { Citadel }",
            location_id:
            {
              solarSystemID: "30004716",
              solarSystemName: "4K-TRB",
              constellationName: "B4H-9W",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },

          "1140475240":
          {
            bookmark_id: "1140475240",
            created: "2018-01-13T07:05:43Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785192",
            item:
            {
              item_id: "1024322800616",
              type_id: "35833",
              typeName: "Fortizar",
              description: `Conceived as a good balance of capability and investment in the Upwell Consortium's Citadel range of space stations, the Fortizar has been designed for large-scale operations in space, such as providing a well-equipped home for large corporations and small alliances, or as a border or trade post for larger alliances.

            The Fortizar has been built with new spaceship tethering technology as standard, and will readily accommodate most ships, including freighters and even capital ships, in its internal docking bays.While the docks are unable to service 'supercapital' level vessels, the defensive capabilities of the Fortizar are considerably enhanced in lower security star systems with the ability to mount area effect weapons.The Fortizar can be configured using Upwell's Standup brand service and structure modules so as to serve the specific needs of the structure operator. Further adjustment of the hardware of the Fortizar can be achieved by installed Standup L-Set rigs to optimize the specific role of the citadel.`,
              standing: 0,
            },

            label: "Cargo",
            location_id:
            {
              solarSystemID: "30004746",
              solarSystemName: "4O-239",
              constellationName: "D5-SOW",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },

          "1140526237":
          {
            bookmark_id: "1140526237",
            created: "2018-01-13T12:54:40Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785192",
            item:
            {
              item_id: "1022091479734",
              type_id: "35832",
              typeName: "Astrahus",
              description: `As the entry-level product in the Upwell Consortium's Citadel range of space stations, the Astrahus has been designed as an economical option for medium-scale operations in space, such as serving as a base of operations for a small- to medium-sized corporation, or as an outpost for larger corporations or even small alliances.

  The Astrahus has been built with new spaceship tethering technology as standard, and will happily accommodate ships under capital size, and even freighter-class hulls, in its internal docking bays. The Astrahus can be configured using Upwell's Standup brand service and structure modules so as to serve the specific needs of the structure operator. Further adjustment of the hardware of the Astrahus can be achieved by installed Standup M-Set rigs to optimize the specific role of the citadel.`,
              standing: 0,
            },

            label: "Cargo",
            location_id:
            {
              solarSystemID: "30004749",
              solarSystemName: "Q-JQSG",
              constellationName: "D5-SOW",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },

          "1144115272":
          {
            bookmark_id: "1144115272",
            created: "2018-01-30T12:52:22Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785192",
            item:
            {
              item_id: "1027847404774",
              type_id: "47513",
              typeName: "'Draccous' Fortizar",
              description: "",
              standing: 0,
            },

            label: "cargo",
            location_id:
            {
              solarSystemID: "30004731",
              solarSystemName: "JP4-AA",
              constellationName: "SPNZ-Z",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },

          "1159667079":
          {
            bookmark_id: "1159667079",
            created: "2018-04-13T05:12:17Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785192",
            item:
            {
              item_id: "1026060773356",
              type_id: "35833",
              typeName: "Fortizar",
              description: `Conceived as a good balance of capability and investment in the Upwell Consortium's Citadel range of space stations, the Fortizar has been designed for large-scale operations in space, such as providing a well-equipped home for large corporations and small alliances, or as a border or trade post for larger alliances.

            The Fortizar has been built with new spaceship tethering technology as standard, and will readily accommodate most ships, including freighters and even capital ships, in its internal docking bays.While the docks are unable to service 'supercapital' level vessels, the defensive capabilities of the Fortizar are considerably enhanced in lower security star systems with the ability to mount area effect weapons.The Fortizar can be configured using Upwell's Standup brand service and structure modules so as to serve the specific needs of the structure operator. Further adjustment of the hardware of the Fortizar can be achieved by installed Standup L-Set rigs to optimize the specific role of the citadel.`,
              standing: 0,
            },

            label: "1B-VKF - DEP Naval Station { Citadel },	",
            location_id:
            {
              solarSystemID: "30004728",
              solarSystemName: "1B-VKF",
              constellationName: "O5K-Y6",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },
        },
      },
      "3785201":
      {
        folder_id: "3785201",
        name: "Safe",
        inside:
        {
          "1140308596":
          {
            bookmark_id: "1140308596",
            coordinates:
            {
              x: -106337406906.9,
              y: -294908066963.25,
              z: -234604451436.37,
            },

            created: "2018-01-12T13:14:55Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785201",
            label: "Safe ?",
            location_id:
            {
              solarSystemID: "30004746",
              solarSystemName: "4O-239",
              constellationName: "D5-SOW",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },

          "1140314566":
          {
            bookmark_id: "1140314566",
            coordinates:
            {
              x: 37917818880,
              y: 18956943360,
              z: -62147788800,
            },

            created: "2018-01-12T13:52:36Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785201",
            label: "Safe",
            location_id:
            {
              solarSystemID: "30004716",
              solarSystemName: "4K-TRB",
              constellationName: "B4H-9W",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },

          "1140521409":
          {
            bookmark_id: "1140521409",
            coordinates:
            {
              x: 124653404179.41,
              y: -85866579830.278,
              z: -143630011405.37,
            },

            created: "2018-01-13T12:28:33Z",
            creator_id:
            {
              name: "Runar Elshenar",
              ID: "94443335",
              Standing: 10.0,
            },

            folder_id: "3785201",
            label: "safe",
            location_id:
            {
              solarSystemID: "30004749",
              solarSystemName: "Q-JQSG",
              constellationName: "D5-SOW",
              regionName: "Delve",
              standing: 0,
            },

            notes: "",
          },
        }
      },
      "1140142601":
      {
        bookmark_id: "1140142601",
        created: "2018-01-11T16:04:36Z",
        creator_id: {
          name: "Runar Elshenar",
          ID: "94443335",
          Standing: 10.0,
        },

        item:
        {
          item_id: "1022734985679",
          type_id: "35834",
          typeName: "Keepstar",
          description: `Envisaged as the flagship product in the Upwell Consortium's Citadel range of space stations, the Keepstar has been designed for the most important and largest-scale of operations in space, such as providing a fully-featured home for large alliances, and even coalitions, or as a key element in the fortification of large territorial empires.
The Keepstar has been built with new spaceship tethering technology as standard, and it will accommodate all size classes of ship, including 'supercapital' vessels, in its internal docking bays. The defensive capabilities of the Keepstar are formidable and are highly enhanced in lower security star systems with the ability to mount area effect and 'doomsday' weapons. The Keepstar can be configured using Upwell's Standup brand service and structure modules so as to serve the specific needs of the structure operator. Further adjustment of the hardware of the Keepstar can be achieved by installed Standup XL-Set rigs to optimize the specific role of the citadel.`,
          standing: 0,
        },

        label: "Trade",
        location_id:
        {
          solarSystemID: "30004759",
          solarSystemName: "1DQ1-A",
          constellationName: "O-EIMK",
          regionName: "Delve",
          standing: 0,
        },

      },

    },
  };

}
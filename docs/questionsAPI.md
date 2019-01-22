# Questions APIs

## Route `/api/questions`

Gets the list of default questions as configured

```json
{
  "info": [
      "How long have you been playing Eve?",
      "PVP or PVE? Why"
  ]
}
```

## Route `/api/questions/:userId`

`userId` {int} id of the applicant main

Gets the questions and answers for the given applicant 
If not a main, find the main first

```json
{
  "info": [
    {
      "a": "5 years plus",
      "userId": 2114725334,
      "q": "How long have you been playing Eve?"
    },
    {
      "a": "",
      "userId": 2114725334,
      "q": "PVP or PVE? Why"
    }
  ]
}
```
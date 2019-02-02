# Questions APIs

## Route `/api/questions`

Gets the list of default questions as configured

```json
{
  "180980981": "How long have you been playing Eve?",
  "987698766": "PVP or PVE? Why"
}
```

## Route `/api/answers/:userId` or `/api/answers`

`userId` {int} id of the applicant main. If None assume current session user

Gets the questions and answers for the given applicant.
If not a main, find the main first. The data is stored denormalised with the full
question in case the question was changed since it was answered.

```json
{
  "876876232":
    {
      "answer": "5 years plus",
      "user_id": 2114725334,
      "question": "How long have you been playing Eve?"
    },
  "762576257":
    {
      "answer": "",
      "user_id": 2114725334,
      "question": "PVP or PVE? Why"
    }
}
```
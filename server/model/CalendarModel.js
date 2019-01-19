/* eslint-disable camelcase */
const Esi = require('../src/EsiRequest');
const logging = require('../src/Logging');
const NameCache = require('./NameCache');


class CalendarModel {
  static async get(userId, token) {
    try {
      const namePromises = [];
      const detailsPromises = [];
      const response = await Esi.get(Esi.kinds.Calendar, userId, token);
      const events = response.body;
      events.forEach((event) => {
        detailsPromises.push(Esi.get(Esi.kinds.CalendarDetails, userId, token, event.event_id));
      });
      return Promise.all(detailsPromises).then((eventsData) => {
        eventsData.forEach((event) => {
          const idx = events.findIndex(ev => ev.event_id === event.body.event_id);
          events[idx] = { ...events[idx], ...event.body };
          namePromises.push(NameCache.get(event.body.owner_id, NameCache.getKinds().Character));
        });
        return Promise.all(namePromises).then((data) => {
          const lookup = {};
          data.forEach((result) => {
            lookup[result.id] = result;
          });
          const result = [];
          events.forEach((event) => {
            result.push({
              ...event,
              sender: (lookup[event.owner_id] || {}).name,
            });
          });
          return result;
        });
      });
    } catch (err) {
      logging.error(`CalendarModel get ${err.message}`);
      return {};
    }
  }

  static async getEvent(userId, eventId, token) {
    try {
      const namePromises = [];
      const names = [];
      const response = await Esi.get(Esi.kinds.CalendarAttendees, userId, token, eventId);
      const attendees = response.body;
      attendees.forEach((character) => {
        namePromises.push(NameCache.get(character.character_id, NameCache.getKinds().Character));
      });
      return Promise.all(namePromises).then((data) => {
        const lookup = {};
        data.forEach((result) => {
          lookup[result.id] = result;
        });
        attendees.forEach((character) => {
          if (lookup[character.character_id]) {
            names.push(lookup[character.character_id].name);
          } else {
            console.error(`not found ${character.character_id}`);
          }
        });
        return names;
      });
    } catch (err) {
      logging.error(`CalendarModel getEvent ${err.message}`);
      return {};
    }
  }
}

module.exports = CalendarModel;

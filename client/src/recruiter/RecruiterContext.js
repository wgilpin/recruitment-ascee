import React from 'react';

const context = React.createContext({
  roles: {
    is_recruiter: false,
    is_senior_recruiter: false,
    is_admin: false,
  },
});

export const RecruiterProvider = context.Provider;
export const RecruiterConsumer = context.Consumer;
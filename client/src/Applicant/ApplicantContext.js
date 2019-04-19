import React from 'react';

const context = React.createContext({
  altsDone: false,
  ready: false,
  has_application: false,
});

export const ApplicantProvider = context.Provider;
export const ApplicantConsumer = context.Consumer;
import React from 'react';
import { mount } from 'enzyme';
import renderer from 'react-test-renderer';
import AdminConfig from '../AdminConfig';

let mockFetch;

beforeEach(() => {
  const serverState = {
    get_character: {
      id: 1234,
      name: 'user 1',
    },
    template: {
      name: 'invite',
      subject: 'Test Rejection Email',
      text: "Ignore this - you haven't really been rejected",
    },
  };

  mockFetch = jest.fn().mockImplementation((scope, params) => {
    if (scope.scope === 'mail/get_character') {
      return Promise.resolve({
        info: serverState.get_character,
      });
    } else if (scope.scope.indexOf('mail/template') !== -1) {
      return Promise.resolve({
        info: serverState.template,
      });
    } else {
      throw new Error('Scope Not Valid');
    }
  });
});

describe('<AdminConfig>', () => {
  it('renders without crashing', () => {
    mount(<AdminConfig fetcher={mockFetch}/>);
  });

  it('matches snapshot', async () => {
    const adminConfig = mount(<AdminConfig fetcher={mockFetch} />);
    const tree = renderer.create(adminConfig);
    await Promise.resolve();
    expect(tree.toJSON()).toMatchSnapshot();
  });
});

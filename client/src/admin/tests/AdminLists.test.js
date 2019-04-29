import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import AdminLists from './../AdminLists';

let mockFetch;

beforeEach(() => {
  const serverState = {
    'character': [{"id":299590276,"name":"Major Sniper"},{"id":91027948,"name":"Recruiter TS"},{"id":94476783,"name":"Miyogi San"}],
    'inventory_type': [{"id":40520,"name":"Large Skill Injector"},{"id":11568,"name":"Avatar Blueprint"},{"id":40519,"name":"Skill Extractor"},{"id":23773,"name":"Ragnarok"},{"id":11567,"name":"Avatar"},{"id":23774,"name":"Ragnarok Blueprint"}],
    'alliance': [{id: 123, name: 'alliance1'}],
    'corporation': [{id: 1234, name: 'corp1'}],
    'system': [{"id":30004759,"name":"1DQ1-A"}],
    'user': [{"id":299590276,"name":"Major Sniper"}],
  };

  mockFetch = jest.fn().mockImplementation((scope, params) => {
    
    if (serverState[scope.id]) {
      return Promise.resolve({
        info: serverState[scope.id],
      });
    } else {
      console.error("Scope Not Valid"+scope.id);
      throw new Error("Scope Not Valid");
    }
  });
});

describe('<AdminRoles>', () => {
  it('renders without crashing', () => {
    shallow(<AdminLists fetcher={mockFetch} />);
  });

  it('matches snapshot', async () => {
    const tree = renderer.create(<AdminLists fetcher={mockFetch} />);
    await Promise.resolve();
    expect(tree.toJSON()).toMatchSnapshot();
  });
});

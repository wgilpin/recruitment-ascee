import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import AdminRoles from './../AdminRoles';

let mockFetch;

beforeEach(() => {
  const serverState = [
    {
      id: 1234,
      name: 'user 1',
      is_recruiter: true,
      is_senior_recruiter: false,
      is_admin: false,
    },
    {
      id: 4321,
      name: 'user 2',
      is_recruiter: true,
      is_senior_recruiter: true,
      is_admin: false,
    },
    {
      id: 1289,
      name: 'user 3',
      is_recruiter: true,
      is_senior_recruiter: true,
      is_admin: true,
    },
    {
      id: 8921,
      name: 'user 4',
      is_recruiter: false,
      is_senior_recruiter: false,
      is_admin: true,
    },
  ];

  mockFetch = jest.fn().mockImplementation((scope, params) => {
    
    if (scope.scope === 'admin/users') {
      
      return Promise.resolve({
        info: serverState,
      });
    } else if (scope.param1==='set_roles') {
      
      const index = serverState.findIndex(item => item.id === scope.id);
      serverState[index] = params;
    } else {
      throw new Error("Scope Not Valid");
    }
  });
});

describe('<AdminRoles>', () => {
  it('renders without crashing', () => {
    shallow(<AdminRoles />);
  });

  it('loads', async done => {
    var wrapper = mount(<AdminRoles fetcher={mockFetch} />);
    setImmediate(() => {
      const { staff, showConfirm } = wrapper.state();
      expect(showConfirm).toEqual(false);
      expect(Object.keys(staff).sort()).toEqual(
        ['1234', '1289', '4321', '8921'].sort()
      );
      done();
    });
  });

  const toggleStatusHelper = async (field, done) => {
    var wrapper = mount(<AdminRoles fetcher={mockFetch} />);
    await Promise.resolve();
    
    wrapper.update();
    const currentState = wrapper.state().staff[1234][field];
    wrapper.instance().handleClickCheck(1234, field);
    wrapper.instance().doChange();
    await Promise.resolve();
    await Promise.resolve();
    
    const newState = wrapper.state().staff[1234][field];
    
    expect(currentState).not.toEqual(newState);
    done();
  };

  it('allows toggling recruiter', async done => {
    toggleStatusHelper('is_recruiter', done);
  });

  it('allows toggling senior recruiter', async done => {
    toggleStatusHelper('is_senior_recruiter', done);
  });
  
  it('allows toggling admin', async done => {
    toggleStatusHelper('is_admin', done);
  });

  it('matches snapshot', async () => {
    const tree = renderer.create(<AdminRoles fetcher={mockFetch} />);
    await Promise.resolve();
    expect(tree.toJSON()).toMatchSnapshot();
  });
});

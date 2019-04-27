import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import AdminRoles from './../AdminRoles';

let mockFetch;

beforeEach(() => {
  mockFetch = jest.fn().mockImplementation(() => {
    return Promise.resolve({
      info: [
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
      ],
    });
  });
});

describe('<AdminRoles>', () => {
  it('renders without crashing', () => {
    shallow(<AdminRoles  />);
  });

  it('loads', async done => {
    var wrapper = mount(<AdminRoles fetcher={mockFetch} />);
    setImmediate(() => {
      const {staff, showConfirm} = wrapper.state();
      expect(showConfirm).toEqual(false);
      expect(Object.keys(staff).sort()).toEqual(['1234', '1289', '4321', '8921'].sort());
      done();
    });
  })

  it('allows toggling recruiter', async (done) => {
    var wrapper = mount(<AdminRoles fetcher={mockFetch} />);
    setImmediate(() => {
      const {staff, showConfirm} = wrapper.state();
      done();
    });
  });

  it('has a search component', () => {
    var wrapper = shallow(<AdminRoles />);
    const input = wrapper.find('FindESICharacter');
    expect(input).toBeDefined()
  });

  it('matches snapshot', async () => {
    const tree = renderer.create(<AdminRoles fetcher={mockFetch} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

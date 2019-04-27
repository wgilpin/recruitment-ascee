import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import FindESICharacter from '../FindESICharacter';

let mockFetch;

beforeEach(() => {
  mockFetch = jest.fn().mockImplementationOnce(() =>{
    return Promise.resolve({
      1234: {
        user_id: 1234,
        name: 'Tommy Rotten',
      },
      4321: {
        user_id: 4321,
        name: 'Nasty Nancy',
      },
    })}
  );
});

describe('Find ESI', () => {
  it('renders without crashing', () => {
    shallow(<FindESICharacter fetcher={mockFetch} />);
  });

  it('does a search', async (done) => {
    var wrapper = mount(<FindESICharacter fetcher={mockFetch} />);
    const input = wrapper.find('input');
    input.simulate('change', { target: { value: 'A Name' } });
    wrapper.find('button').simulate('click');
    expect(mockFetch.mock.calls.length).toBe(1);
    setImmediate(() => {
      wrapper.update() 
      const results = wrapper.state().searchResults;
      expect(Object.keys(results).sort()).toEqual(['1234', '4321'].sort());
      const resultsDOM = wrapper.find('#searchResults')
      expect(resultsDOM).toBeDefined();
      expect(resultsDOM.children().length).toEqual(2);
      done();
    })
    
    
  });

  it('matches snapshot', async () => {
    const tree = renderer
      .create(<FindESICharacter fetcher={mockFetch} />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

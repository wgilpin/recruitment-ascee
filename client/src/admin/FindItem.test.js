import React from 'react';
import { shallow, mount } from 'enzyme';
import renderer from 'react-test-renderer';
import FindItem from './FindItem';

let mockFetch;

beforeEach(() => {
  mockFetch = jest.fn().mockImplementationOnce(() => {
    return Promise.resolve({
      info: {
        'Tommy Rotten': 12345,
        'Nasty Nancy': 54321,
      },
    });
  });
});

describe('Find Item', () => {
  it('has a search button', () => {
    var wrapper = shallow(<FindItem />);
    const button = wrapper.find('button').findWhere(n => n.text() === 'Search');
    expect(button.exists()).toEqual(true);
  })

  it('has add many button', () => {
    var wrapper = shallow(<FindItem />);
    const button = wrapper.find('button').findWhere(n => n.text() === 'Add Many');
    expect(button.exists()).toEqual(true);
  })

  it('has results', () => {
    var wrapper = shallow(<FindItem />);
    const results = wrapper.find('#results');
    expect(results.exists()).toEqual(true);
  })

  it('does a search', async (done) => {
    var wrapper = mount(<FindItem fetcher={mockFetch} />);
    const input = wrapper.find('input');
    input.simulate('change', { target: { value: 'A Name' } });
    const searchBtn = wrapper.find('button').findWhere(n => n.type()==='button' && n.text() === 'Search')
    searchBtn.simulate('click');
    setImmediate(() => {
      wrapper.update() 
      const results = wrapper.state().searchResults;
      expect(Object.keys(results).sort()).toEqual(["Nasty Nancy", "Tommy Rotten"].sort());
      const resultsDOM = wrapper.find('#results')
      expect(resultsDOM).toBeDefined();
      expect(resultsDOM.children().length).toEqual(2);
      done();
    })
    
  });


  it('matches snapshot', async () => {
    const tree = renderer
      .create(<FindItem />)
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

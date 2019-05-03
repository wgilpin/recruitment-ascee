import React from 'react';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import Alts from '../Alts';

let mockFetch;

let serverState;

beforeEach(() => {
  window.alert = () => {};
  serverState = {
    character: {
      alliance_id: 1354830081,
      alliance_name: 'Goonswarm Federation',
      ancestry_id: 18,
      birthday: '2013-06-09T08:05:44+00:00',
      bloodline_id: 8,
      character_id: 93459541,
      character_name: 'Andrew Nighthawk',
      corporation_id: 98409330,
      corporation_name: 'Ascendance',
      current_application_id: 18,
      description:
        '<font size="12" color="#bfffffff"></font><font size="18" color="#bfffffff">No man truely owns anything..  <br>He is mearly borrowing it until something bigger than him takes it away.<br><br><br><br><br><br><br><br><br><br><br><br></font><font size="18" color="#ff007fff">Recruitment is currently open. <br>Join</font><font size="18" color="#bfffffff"> </font><font size="18" color="#ff6868e1"><a href="joinChannel:player_-71200765//None//None">Ascendance recruitment</a></font><font size="18" color="#bfffffff"> </font><font size="18" color="#ff007fff">and speak to one of our recruiters</font>',
      gender: 'male',
      race_id: 8,
      redlisted: [],
      security_status: 5.008887629879013,
    },
    'user/corporations': {
      '98503673': {
        ceo_id: 93908806,
        ceo_name: 'Midgely Urea',
        corporation_name: 'Winnits and Other Things',
      },
      '98555774': {
        ceo_id: 2113387072,
        ceo_name: 'Kate Flashheart',
        corporation_name: "Kate's Manservant Recruitment Agency",
      },
    },
    'user/characters': {
      '94399527': {
        corporation_id: 98409330,
        corporation_name: 'Ascendance',
        name: 'Semirhage Boan',
      },
      '93908806': {
        corporation_id: 98503673,
        corporation_name: 'Winnits and Other Things',
        name: 'The Flight Lieutenant',
      },
      '2114725334': {
        corporation_id: 98409330,
        corporation_name: 'Ascendance',
        name: 'Entropics Applicant',
      },
    },
  };

  mockFetch = jest.fn().mockImplementation((scope, params) => {
    if (!serverState[scope.scope]) {
      throw new Error('Invalid Scope');
    }
    return Promise.resolve({
      info: serverState[scope.scope],
    });
  });
});

describe('<Alts>', () => {
  it('matches snapshot', async () => {
    const adminConfig = mount(
      <Alts
        main={'93908806'}
        childrenTop
        highlightMain
        showPointer
        fetcher={mockFetch}
      />
    );
    const tree = renderer.create(adminConfig);
    await Promise.resolve();
    await Promise.resolve();
    await Promise.resolve();
    expect(tree.toJSON()).toMatchSnapshot();
  });
});

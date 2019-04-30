import React from 'react';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import AltsPanel from './../AltsPanel';

let mockFetch;

let serverState;

beforeEach(() => {
  window.alert = () => {};
  serverState = {
    characters: {
      info: {
        '94399527': {
          corporation_id: 98409330,
          corporation_name: 'Ascendance',
          name: 'Semirhage Boan',
        },
        '2114029936': {
          corporation_id: 98409330,
          corporation_name: 'Ascendance',
          name: 'The Flight Lieutenant',
        },
        '2114725334': {
          corporation_id: 98409330,
          corporation_name: 'Ascendance',
          name: 'Entropics Applicant',
        },
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

describe('<AltsPanel>', () => {
  it('renders without crashing', () => {
    mount(
      <AltsPanel
        fetcher={mockFetch}
        answers={serverState.answers}
        questions={serverState.questions}
        onReadyStatus={() => null}
      />
    );
  });

  it('checks when all questions have answers', () => {
    const onReadyFn = jest.fn();
    const wrapper = shallow(
      <AltsPanel
        fetcher={mockFetch}
        onAltsDone={this.handleAltsDone}
      />
    )
      .instance()
      .handleSaveAnswers();
    expect(onReadyFn).toHaveBeenCalled();
  });

  
  it('matches snapshot', async () => {
    const adminConfig = mount(
      <AltsPanel
        fetcher={mockFetch}
        answers={serverState.answers}
        questions={serverState.questions}
        onReadyStatus={() => null}
      />
    );

    const tree = renderer.create(adminConfig);
    await Promise.resolve();
    expect(tree.toJSON()).toMatchSnapshot();
  });
});

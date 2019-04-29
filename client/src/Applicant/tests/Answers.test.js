import React from 'react';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import Answers from '../Answers';

let mockFetch;

let serverState;

beforeEach(() => {
  window.alert = () => {};
  serverState = {
    questions: {
      '7': 'How long have you been playing Eve for?',
      '15': 'PVP or PVE? Why?',
      '16': 'Do you like this new application ?',
      '17': 'Can you write reactJs? If so, why am I writing this app??',
      '18': 'Can you confirm that you are a spai ?',
    },
    answers: {
      has_application: true,
      questions: {
        '7': {
          answer: 'app 2 5 years',
          question: 'How long have you been playing Eve for?',
          user_id: 2114725334,
        },
        '15': {
          answer: 'app 2 PVP',
          question: 'PVP or PVE? Why?',
          user_id: 2114725334,
        },
        '16': {
          answer:
            'from models import Note, Answer, User, Character, db, Application, Admin, Recruiter\nfrom security import has_applicant_access, is_admin, is_senior_recruiter, is_recruiter, \\\n    user_admin_access_check, user_application_access_check\nimport cachetools\nfrom exceptions import BadRequestException, ForbiddenException\nfrom models import Question\nfrom:',
          question: 'Do you like this new application ?',
          user_id: 2114725334,
        },
        '17': {
          answer: 'why would I?',
          question: 'Can you write reactJs? If so, why am I writing this app??',
          user_id: 2114725334,
        },
        '18': {
          answer: 'I am',
          question: 'Can you confirm that you are a spai ?',
          user_id: 2114725334,
        },
      },
    },
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
    return Promise.resolve({
      info: serverState[scope.scope],
    });
  });
});

describe('<Answers>', () => {
  it('renders without crashing', () => {
    mount(
      <Answers
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
      <Answers
        fetcher={mockFetch}
        answers={serverState.answers}
        questions={serverState.questions}
        onReadyStatus={onReadyFn}
      />
    )
      .instance()
      .handleSaveAnswers();
    expect(onReadyFn).toHaveBeenCalled();
  });

  
  it('matches snapshot', async () => {
    const adminConfig = mount(
      <Answers
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

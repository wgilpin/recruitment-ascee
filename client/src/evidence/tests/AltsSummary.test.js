import React from 'react';
import { mount, shallow } from 'enzyme';
import renderer from 'react-test-renderer';
import AltSummary from '../AltSummary';

const corps =  [
  {
    ceo_id: 93908806,
    ceo_name: 'Midgely Urea',
    corporation_name: 'Winnits and Other Things',
  },
  {
    ceo_id: 2113387072,
    ceo_name: 'Kate Flashheart',
    corporation_name: "Kate's Manservant Recruitment Agency",
  },
]

const char_93908806 = {
  id: 93908806,
  corporation_id: 98503673,
  corporation_name: 'Winnits and Other Things',
  name: 'The Flight Lieutenant',
}

describe('<AltSummary>', () => {
  it('matches snapshot', async () => {
    const adminConfig = mount(
      <AltSummary
      corporations={corps}
      selected={char_93908806.id}
      corporationId={char_93908806.corporation_id}
      corpRedlisted={false}
      corporationName={char_93908806.corporation_name}
      secStatus={5.0}
      />
    );
    const tree = renderer.create(adminConfig);
    await Promise.resolve();
    expect(tree.toJSON()).toMatchSnapshot();
  });
});

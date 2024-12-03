import { CustomCountryPipe } from './custom-country.pipe';

describe('CustomCountryPipe', () => {
  it('create an instance', () => {
    const pipe = new CustomCountryPipe();
    expect(pipe).toBeTruthy();
  });
});

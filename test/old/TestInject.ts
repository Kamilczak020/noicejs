import { expect } from 'chai';
import { getDepends } from 'src/Dependency';
import { Inject } from 'src/Inject';
import { itAsync } from 'test/helpers/async';

describe('inject decorator', async () => {
  itAsync('should return a function', async () => {
    expect(Inject()).to.be.a('function');
  });

  itAsync('should work as a class decorator', async () => {
    const params = [{
      contract: 'a',
      name: 'a'
    }, {
      contract: 'b',
      name: 'b'
    }, {
      contract: 'c',
      name: 'c'
    }];

    @Inject(...params)
    class Target {
      private method() { /* noop */ }
    }

    expect(getDepends(Target)).to.deep.equal(params);
  });
});

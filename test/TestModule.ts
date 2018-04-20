import {expect} from 'chai';
import {spy} from 'sinon';

import {BaseOptions, Container} from 'src/Container';
import {Module, ProviderType} from 'src/Module';
import {describeAsync, itAsync} from 'test/helpers/async';

describeAsync('injection modules', async () => {
  itAsync('should be extendable', async () => {
    class TestModule extends Module {
      public async configure(moduleContainer: Container) { /* noop */ }
    }

    const module = new TestModule();
    spy(module, 'configure');

    const container = Container.from(module);
    await container.configure();

    expect(module.configure).to.have.been.calledOnce;
    expect(module.configure).to.have.been.calledWith(container);
  });

  itAsync('should report bindings', async () => {
    class TestModule extends Module {
      public async configure(moduleContainer: Container) {
        this.bind('a').toConstructor(TestModule);
        this.bind('b').toFactory(() => Promise.resolve(3));
        this.bind('c').toInstance(1);
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(module.has('a'), 'has a constructor').to.be.true;
    expect(module.has('b'), 'has a factory').to.be.true;
    expect(module.has('c'), 'has an instance').to.be.true;
    expect(module.has('d'), 'does not have').to.be.false;
  });

  itAsync('should get the same instance each time', async () => {
    class TestModule extends Module {
      public async configure(moduleContainer: Container) {
        this.bind('c').toInstance({});
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    const check = await container.create('c');
    const again = await container.create('c');

    expect(check).to.equal(again);
  });

  itAsync('should convert contract names', async () => {
    class TestClass { /* noop */ }
    class TestModule extends Module {
      public async configure(moduleContainer: Container) {
        this.bind(TestClass).toConstructor(TestClass);
      }
    }

    const module = new TestModule();
    const container = Container.from(module);
    await container.configure();

    expect(module.has(TestClass.name), 'has a constructor').to.be.true;
  });

  itAsync('should invoke complex factories', async () => {
    class TestInstance { }
    let instance: TestInstance;

    class TestModule extends Module {
      public async configure(moduleContainer: Container) {
        this.bind('a').toFactory(async (options) => this.getInstance(options));
      }

      public async getInstance(options: BaseOptions): Promise<TestInstance> {
        if (!instance) {
          instance = await options.container.create(TestInstance);
        }

        return instance;
      }
    }

    const module = new TestModule();
    spy(module, 'getInstance');

    const container = Container.from(module);
    await container.configure();

    const ref = await container.create('a');

    expect(module.has('a')).to.be.true;
    expect(module.get('a').type).to.equal(ProviderType.Factory);

    expect(module.getInstance).to.have.been.calledOnce;
    expect(module.getInstance).to.have.been.calledWith({container});

    expect(ref, 'return the same instance').to.equal(await container.create('a'));
  });
});

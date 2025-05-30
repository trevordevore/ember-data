import * as s from '@ember/service';

import { module, test } from 'qunit';

import Store from 'ember-data/store';
import { setupTest } from 'ember-qunit';

import RequestManager from '@ember-data/request';

const service = s.service ?? s.inject;

module('Integration | Store Extension', function (hooks) {
  setupTest(hooks);

  test('We can create a store ', function (assert) {
    const { owner } = this;
    class CustomStore extends Store {}
    owner.register('service:store', CustomStore);
    const store = owner.lookup('service:store') as CustomStore;

    assert.true(typeof store.requestManager !== 'undefined', 'We create a request manager for the store automatically');
  });

  test('We can create a store with a custom request manager injected as a service', function (assert) {
    const { owner } = this;
    class CustomStore extends Store {
      @service declare requestManager: RequestManager;
    }

    owner.register('service:store', CustomStore);
    owner.register('service:request-manager', RequestManager);
    const requestManager = owner.lookup('service:request-manager');
    const store = owner.lookup('service:store') as CustomStore;

    assert.true(store.requestManager === requestManager, 'We can inject a custom request manager into the store');
  });

  test('We can create a store with a custom request manager initialized as a field', function (assert) {
    const { owner } = this;
    const requestManager = new RequestManager();
    class CustomStore extends Store {
      requestManager = requestManager;
    }

    owner.register('service:store', CustomStore);
    const store = owner.lookup('service:store') as CustomStore;

    assert.true(store.requestManager === requestManager, 'We can inject a custom request manager into the store');
  });
});

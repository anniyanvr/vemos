import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | vemos/main/join', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:vemos/main/join');
    assert.ok(route);
  });
});

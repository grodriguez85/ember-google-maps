/* eslint-disable no-console */

import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | google-maps-api', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    window.google = undefined;

    this.service = this.owner.lookup('service:google-maps-api');
  });

  test('it loads the Google Maps API', async function (assert) {
    await this.service._getApi();
    assert.ok(google.maps);
  });

  test('it skips loading the Google Maps API if it is already loaded', async function (assert) {
    let multipleAPIsRegex =
      /Google Maps JavaScript API multiple times on this page/;
    let error = console.error;

    try {
      console.error = function (msg) {
        if (multipleAPIsRegex.test(msg)) {
          assert.ok(
            false,
            'The API loader should not load the API multiple times.'
          );
        }

        if (error) {
          error.apply(console, arguments);
        }
      };

      await this.service._getApi();
      assert.ok(google.maps);

      // Should skip loading the API again.
      await this.service._getApi();
    } finally {
      console.error = error;
    }
  });
});

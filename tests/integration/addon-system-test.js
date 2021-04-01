import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'dummy/tests/helpers/locations';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Addon System', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it registers a pin (marker) component from an addon with the keyword “ember-google-maps-addon”', async function (assert) {
    await render(hbs`
      <GMap @lat={{lat}} @lng={{lng}} as |g|>
        <g.pin @lat={{lat}} @lng={{lng}} />
      </GMap>
    `);

    let {
      map,
      components: { markers },
    } = this.gMapAPI;
    let marker = markers[0].mapComponent;

    assert.equal(markers.length, 1);
    assert.equal(marker.map, map);
  });
});

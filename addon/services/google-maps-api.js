import Service from '@ember/service';
import { Promise, reject, resolve } from 'rsvp';
import { getOwner } from '@ember/application';
import { bind } from '@ember/runloop';
import { assert } from '@ember/debug';
import { waitFor } from '@ember/test-waiters';

import { getAsync } from '../utils/async-data';

export default class GoogleMapsApiService extends Service {
  @getAsync
  get google() {
    return this._getApi();
  }

  @getAsync
  get directionsService() {
    return this.google.then((google) => new google.maps.DirectionsService());
  }

  /**
   * By default, this returns the Google Maps URL created at build time. You can
   * use this hook to build the URL at runtime instead.
   *
   * Optionally, you can return a promise that resolves with the URL. This
   * allows you to use external data when building the URL. For example, you
   * could fetch the database record for the current user for localisation
   * purposes.
   */
  buildGoogleMapsUrl(config) {
    return config['src'];
  }

  /**
   * Get the configuration for ember-google-maps set in environment.js. This
   * should contain your API key and any other options you set.
   */
  _getConfig() {
    return getOwner(this).resolveRegistration('config:environment')[
      'ember-google-maps'
    ];
  }

  /**
   * Return or load the Google Maps API.
   */
  @waitFor
  _getApi() {
    if (typeof document === 'undefined') {
      return reject();
    }

    if (window?.google?.maps) {
      return resolve(window.google);
    }

    let config = this._getConfig();

    return resolve(config)
      .then(this.buildGoogleMapsUrl)
      .then(this._loadAndInitApi);
  }

  _loadAndInitApi(src) {
    assert(
      `
ember-google-maps: You tried to load the Google Maps API, but the source URL was empty. \
Perhaps you forgot to specify the API key? \
Learn more: https://ember-google-maps.sandydoo.me/docs/getting-started`,
      src
    );

    return new Promise((resolve, reject) => {
      window.initGoogleMap = bind(() => {
        resolve(window.google);
      });

      let s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.onerror = (error) => reject(error);
      // Insert into DOM to avoid CORS problems
      document.body.appendChild(s);

      // Load map
      s.src = `${src}&callback=initGoogleMap`;
    });
  }
}

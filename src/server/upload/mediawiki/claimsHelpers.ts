import type { LonLat } from '../../../services/types';

const locationFactory =
  (property: string) =>
  ([longitude, latitude]: LonLat) => ({
    type: 'statement',
    mainsnak: {
      snaktype: 'value',
      property,
      datavalue: {
        type: 'globecoordinate',
        value: {
          latitude,
          longitude,
          globe: 'http://www.wikidata.org/entity/Q2',
          precision: 0.000001,
        },
      },
    },
  });

const createDate = (time: string) => ({
  type: 'statement',
  mainsnak: {
    snaktype: 'value',
    property: 'P571',
    datavalue: {
      type: 'time',
      value: {
        time: `+${time.split('T')[0]}T00:00:00Z`,
        timezone: 0,
        before: 0,
        after: 0,
        precision: 11,
        calendarmodel: 'http://www.wikidata.org/entity/Q1985727',
      },
    },
  },
});

const createCopyrightLicense = () => ({
  type: 'statement',
  mainsnak: {
    snaktype: 'value',
    property: 'P275',
    datavalue: {
      type: 'wikibase-entityid',
      value: {
        'entity-type': 'item',
        'numeric-id': 18199165,
        id: 'Q18199165', // CC BY-SA 4.0
      },
    },
  },
});

const createCopyrightStatus = () => ({
  type: 'statement',
  mainsnak: {
    snaktype: 'value',
    property: 'P6216',
    datavalue: {
      type: 'wikibase-entityid',
      value: {
        'entity-type': 'item',
        'numeric-id': 50423863,
        id: 'Q50423863', // copyrighted
      },
    },
  },
});

export const claimsHelpers = {
  /** https://www.wikidata.org/wiki/Property:P275 copyright license */
  createCopyrightLicense,
  /** https://www.wikidata.org/wiki/Property:P6216 copyright status */
  createCopyrightStatus,
  /** https://www.wikidata.org/wiki/Property:P571 inception/date */
  createDate,
  /** https://www.wikidata.org/wiki/Property:P9149 coordinates of depicted place */
  createPlaceLocation: locationFactory('P9149'),
  /** https://www.wikidata.org/wiki/Property:P1259 point of view */
  createPhotoLocation: locationFactory('P1259'),
};

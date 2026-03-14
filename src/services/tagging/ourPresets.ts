import { Presets } from './types/Presets';
import type { RawFields } from './types/Fields';

export const ourFields: RawFields = {
  'climbing/summit_log': {
    key: 'climbing:summit_log',
    type: 'check',
  },
  'climbing/routes': {
    key: 'climbing:routes',
    type: 'number',
    minValue: 0,
  },
  'climbing/rock': {
    key: 'climbing:rock',
    type: 'combo',
    options: ['limestone', 'sandstone', 'granite', 'basalt'],
  },
  'climbing/quality': {
    key: 'climbing:quality',
    type: 'combo',
    options: ['fragile', 'medium', 'solid'],
  },
  'climbing/orientation': {
    key: 'climbing:orientation',
    type: 'combo',
    options: ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'],
  },
  'climbing/bolts': {
    key: 'climbing:bolts',
    type: 'number',
    minValue: 0,
  },
  'climbing/bolted': {
    key: 'climbing:bolted',
    type: 'check',
  },
  'climbing/bolt': {
    key: 'climbing:bolt',
    type: 'combo',
    options: ['expansion', 'glue-in', 'ring'],
  },
};

const routeFields = [
  'climbing/bolts',
  'climbing/bolted',
  'climbing/bolt',
  'climbing/orientation',
  'climbing/quality',
  'climbing/rock',
  'climbing/summit_log',
];

export const modifyPresets = (presets: Presets) => {
  presets['climbing/route'].moreFields.push(...routeFields);
  presets['climbing/route_bottom'].moreFields.push(...routeFields);
  presets['climbing/crag'].geometry.push('line'); // line is not intended use, but we need to match way+climbing=crag
  presets['type/site/climbing/area'].geometry.push('point'); // to be able to create it from node

  presets['climbing/route_top'] = JSON.parse(
    JSON.stringify(presets['climbing/route_bottom']),
  );
  presets['climbing/route_top'].tags.climbing = 'route_top';
  presets['climbing/route_top'].addTags.climbing = 'route_top';

  return presets;
};

// eslint-disable-next-line max-lines-per-function

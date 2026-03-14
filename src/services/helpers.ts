import fetch from 'isomorphic-unfetch';
import { OsmId } from './types';

export const getShortId = ({ id, type }: OsmId): string => `${type[0]}${id}`;






export const prod = process.env.NODE_ENV === 'production';




// TODO better mexico border + add Australia, New Zealand & South Africa





// Accuracy = 1m, see https://gis.stackexchange.com/questions/8650/measuring-accuracy-of-latitude-and-longitude



// Degrees and Minutes


// https://wiki.openstreetmap.org/wiki/Zoom_levels
// https://medium.com/techtrument/how-many-miles-are-in-a-pixel-a0baf4611fff
// const metersPerPxOnEquator = 156543.03392
// const mPerPx = metersPerPxOnEquator * Math.cos(lat * Math.PI / 180) / Math.pow(2, zoom)




export const publishDbgObject = (key, value) => {
  if (typeof window !== 'undefined') {
    // @ts-ignore
    if (!window.dbg) window.dbg = {};
    // @ts-ignore
    window.dbg[key] = value;
    // @ts-ignore
    if (!window.d) window.d = {};
    // @ts-ignore
    window.d[key] = value;
  }
};



// decides whether to fetch memberFeatures








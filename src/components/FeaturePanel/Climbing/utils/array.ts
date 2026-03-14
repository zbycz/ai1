

export const updateElementOnIndex = <T>(
  array: Array<T>,
  index: number,
  callback?: (oldValue: T) => T,
): Array<T> => {
  const updatedItem = callback ? callback(array[index]) : null;
  return [
    ...array.slice(0, index),
    ...(updatedItem ? [updatedItem] : []),
    ...array.slice(index + 1),
  ];
};



const naturalCompare = (a, b) => {
  return a?.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: 'base',
  });
};

export const naturalSort = (array, reducer = (item) => item) => {
  return array.sort((a, b) => {
    return naturalCompare(reducer(a), reducer(b));
  });
};

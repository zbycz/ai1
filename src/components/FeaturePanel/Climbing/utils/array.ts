

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





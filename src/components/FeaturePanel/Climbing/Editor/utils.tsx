import React from 'react';
import { useClimbingContext } from '../contexts/ClimbingContext';


export const usePointClickHandler = (index: number) => {
  const {
    pointElement,
    isPointMoving,
    setPointElement,
    setPointSelectedIndex,
    setIsPointMoving,
    setIsPointClicked,
    pointSelectedIndex,
    machine,
    getCurrentPath,
  } = useClimbingContext();
  const path = getCurrentPath();

  return (e: any) => {
    if (isPointMoving) {
      return;
    }

    machine.execute('showPointMenu');
    const isDoubleClick = e.detail === 2;
    const lastPointIndex = path.length - 1;
    if (isDoubleClick && pointSelectedIndex === lastPointIndex) {
      machine.execute('finishRoute');
    }

    setPointElement(pointElement !== null ? null : e.currentTarget);
    setPointSelectedIndex(index);
    setIsPointMoving(false);
    setIsPointClicked(false);
    e.stopPropagation();
    e.preventDefault();
  };
};

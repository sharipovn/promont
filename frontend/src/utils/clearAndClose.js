export const clearAndClose = (setShow, ...resetFns) => () => {
  resetFns.forEach((fn) => fn?.(''));
  setShow(false);
};

// utils/guard.js
export const guard = (setSubmitting) => (asyncFunc) => async (...args) => {
  setSubmitting((prev) => {
    if (prev) return true; // Already submitting
    return true;
  });

  try {
    await asyncFunc(...args);
  } finally {
    setSubmitting(false);
  }
};

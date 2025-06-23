export function withValidation(message) {
  return {
    onInvalid: (e) => e.target.setCustomValidity(message),
    onInput: (e) => e.target.setCustomValidity(''),
  };
}

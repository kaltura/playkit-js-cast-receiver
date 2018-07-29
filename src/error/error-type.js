// @flow
const ErrorType: {[type: string]: Object} = {
  CAST_ELEMENT_NOT_FOUND: {
    code: 100020,
    description: "<cast-media-element> tag isn't found in the DOM"
  }
};

export {ErrorType};

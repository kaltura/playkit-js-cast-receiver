// @flow
class ReceiverError {
  code: number;
  description: string;

  constructor(type: Object) {
    this.code = type.code;
    this.description = type.description;
  }
}

export {ReceiverError};

// @flow
import {ReceiverManagerAPI} from './receiver-manager-api';

declare var __VERSION__: string;
declare var __NAME__: string;

const VERSION = __VERSION__;
const NAME = __NAME__;

export {ReceiverManagerAPI as Receiver};
export {VERSION, NAME};

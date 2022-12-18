import { TimeValue } from '../models/common';

export const now = (): TimeValue => Date.now() as TimeValue;

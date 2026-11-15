import * as settings from '../settings/index.page.s.layout';
import * as notifications from '../notifications/index.page.s.layout';
import * as radio from '../time-format/index.page.s.layout';
import { createAdhkarLayout } from './layout';

export const LAYOUT = createAdhkarLayout(settings, notifications, radio, true);

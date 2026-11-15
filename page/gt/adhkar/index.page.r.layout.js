import * as settings from '../settings/index.page.r.layout';
import * as notifications from '../notifications/index.page.r.layout';
import * as radio from '../time-format/index.page.r.layout';
import { createAdhkarLayout } from './layout';

export const LAYOUT = createAdhkarLayout(settings, notifications, radio, false);

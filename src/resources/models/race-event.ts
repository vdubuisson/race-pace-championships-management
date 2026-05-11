import { Month, WeekOfMonth } from './calendar';

export type RaceEvent = {
  id?: number;
  championship_name: string;
  track_id: string;
  name: string;
  month: Month;
  week_end: WeekOfMonth;
  mandatory: boolean;
  type: RaceEventType;
  duration: number;
  start_time: string;
};

export type RaceEventType = 'time' | 'laps';

export type RaceEventWithTrack = RaceEvent & { track_name: string };

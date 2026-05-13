export type RaceEvent = {
  id?: number;
  championship_name: string;
  track_id: string;
  name: string;
  month: number;
  week_end: number;
  mandatory: boolean;
  type: RaceEventType;
  duration: number;
  start_time: string;
};

export type RaceEventType = 'time' | 'laps';

export type RaceEventWithTrack = RaceEvent & { track_name: string };

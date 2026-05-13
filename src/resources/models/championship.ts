export type Championship = {
  id?: number;
  name: string;
  categories: Array<string>;
  prestige: number;
  init_month: number;
  init_day: number;
  registration_start_month: number;
  registration_start_day: number;
  registration_end_month: number;
  registration_end_day: number;
  points: Array<number>;
  pit_stop: boolean;
  start_type: StartType;
  field_type: 'identical' | null;
  events_count: number;
  tags: Array<string>;
  start_year: number | null;
  end_year: number | null;
  default_included: boolean;
};

export type StartType = 'standing' | 'rolling';

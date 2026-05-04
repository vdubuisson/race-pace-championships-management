import { DayOfMonth, Month } from "./calendar";

export type Championship = {
  name: string;
  categories: Set<string>;
  prestige: number;
  init_month: Month;
  init_day: DayOfMonth;
  registration_start_month: Month;
  registration_start_day: DayOfMonth;
  registration_end_month: Month;
  registration_end_day: DayOfMonth;
  points: Array<number>;
  pit_stop: boolean;
  start_type: StartType;
  field_type: 'identical' | null;
  events_count: number;
  tags: Set<string>;
  start_year: number;
  end_year: number;
}

export type StartType = 'standing' | 'rolling';

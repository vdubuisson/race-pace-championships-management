export type Track = {
  id: string;
  name: string;
  type: TrackType;
  grade: TrackGrade;
  garages: number;
  country: string;
  length: number;
  turns: number;
  start_year: number;
  end_year: number;
  real_name: string;
  is_mod: boolean;
};

export type TrackType = 'circuit' | 'oval' | 'street' | 'kart' | 'rx' | 'point_to_point';

export type TrackGrade = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

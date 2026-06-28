export type Team = {
  id?: number;
  name: string;
  principal: string;
  driver_loyalty: number | null;
  expectation_level: number | null;
  performance_rating: number | null;
  engineering_weight: number | null;
  engineering_drag: number | null;
  engineering_power: number | null;
};

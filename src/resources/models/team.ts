export type Team = {
  id?: number;
  name: string;
  elo: number;
  principal: string;
  driver_loyalty: number | null;
  expectation_delta: number | null;
}

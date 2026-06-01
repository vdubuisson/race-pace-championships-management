export type Car = {
  id?: number;
  team_name: string;
  category: string;
  model: string;
  livery: string;
  championship_name: string;
  livery_id: number;
  model_folder: string;
};

export type CsvCar = Omit<Car, 'championship_name'> & { championship_names: string[] };

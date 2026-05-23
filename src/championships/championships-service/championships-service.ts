import { ChampionshipRepository } from '@/db/championship-repository';
import { VehicleClassRepository } from '@/db/vehicle-class-repository';
import { ChampionshipWithClasses } from '@/resources/models/championship';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ChampionshipsService {
  private readonly championshipRepository = inject(ChampionshipRepository);
  private readonly vehicleClassRepository = inject(VehicleClassRepository);

  async getChampionship(id: number): Promise<ChampionshipWithClasses> {
    const championship = await this.championshipRepository.getChampionshipById(id);
    if (!championship) {
      throw new Error(`Championship with id ${id} not found`);
    }
    const classes = await this.vehicleClassRepository.getVehicleClassesByIds(
      championship.categories,
    );
    return { ...championship, classes };
  }

  async getChampionships(): Promise<ChampionshipWithClasses[]> {
    const championships = await this.championshipRepository.getAllChampionships();
    const classes = await this.vehicleClassRepository.getAllVehicleClasses();
    const classesById = new Map(classes.map((c) => [c.id, c]));
    return championships.map((championship) => ({
      ...championship,
      classes: championship.categories
        .map((categoryId) => classesById.get(categoryId))
        .filter((c): c is NonNullable<typeof c> => !!c),
    }));
  }
}

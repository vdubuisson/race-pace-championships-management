import { AppDatabase } from '@/db/app-database';
import { CarRepository } from '@/db/car-repository';
import { DriverRepository } from '@/db/driver-repository';
import { TeamRepository } from '@/db/team-repository';
import { Team } from '@/shared/models/team';
import { inject, Service } from '@angular/core';

@Service()
export class TeamsService {
  private readonly appDatabase = inject(AppDatabase);
  private readonly teamRepository = inject(TeamRepository);
  private readonly driverRepository = inject(DriverRepository);
  private readonly carRepository = inject(CarRepository);

  async hasLinks(name: string): Promise<boolean> {
    const linkedDrivers = await this.driverRepository.getDriversByTeamName(name);
    if (linkedDrivers.length > 0) {
      return true;
    }
    const linkedCars = await this.carRepository.getCarsByTeamName(name);
    if (linkedCars.length > 0) {
      return true;
    }
    return false;
  }

  async deleteTeam(id: number): Promise<void> {
    await this.appDatabase.transaction(
      'rw',
      this.teamRepository.store,
      this.driverRepository.store,
      this.carRepository.store,
      async () => {
        const team = await this.teamRepository.getTeamById(id);
        if (!team) {
          throw new Error(`Team with id ${id} not found`);
        }

        await this.teamRepository.deleteTeam(id);
        await this.driverRepository.deleteDriversByTeamName(team.name);
        await this.carRepository.deleteCarsByTeamName(team.name);
      },
    );
  }

  async updateTeam(id: number, originalName: string, newValue: Team): Promise<void> {
    await this.appDatabase.transaction(
      'rw',
      this.teamRepository.store,
      this.driverRepository.store,
      this.carRepository.store,
      async () => {
        await this.teamRepository.updateTeam(id, newValue);
        if (originalName !== newValue.name) {
          await this.driverRepository.updateDriversTeamName(originalName, newValue.name);
          await this.carRepository.updateCarsTeamName(originalName, newValue.name);
        }
      },
    );
  }
}

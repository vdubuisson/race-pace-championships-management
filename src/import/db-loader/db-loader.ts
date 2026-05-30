import { AppDatabase } from '@/db/app-database';
import { Car } from '@/resources/models/car';
import { Championship } from '@/resources/models/championship';
import { RaceEvent } from '@/resources/models/race-event';
import { Team } from '@/resources/models/team';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DbLoader {
  private readonly db = inject(AppDatabase);

  async loadDataIntoDb(
    cars: Car[],
    championships: Championship[],
    events: RaceEvent[],
    teams: Team[],
  ): Promise<void> {
    return this.db.transaction(
      'rw',
      [this.db.cars, this.db.championships, this.db.events, this.db.teams],
      async () => {
        await this.db.cars.clear();
        await this.db.championships.clear();
        await this.db.events.clear();
        await this.db.teams.clear();

        await this.db.cars.bulkAdd(cars);
        await this.db.championships.bulkAdd(championships);
        await this.db.events.bulkAdd(events);
        await this.db.teams.bulkAdd(teams);
      },
    );
  }
}

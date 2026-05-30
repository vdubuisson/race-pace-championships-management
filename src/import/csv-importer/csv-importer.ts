import { inject, Injectable } from '@angular/core';
import { DbLoader } from '../db-loader/db-loader';
import { CsvParser } from '../csv-parser/csv-parser';

@Injectable({ providedIn: 'root' })
export class CsvImporter {
  private readonly csvParser = inject(CsvParser);
  private readonly dbLoader = inject(DbLoader);

  async importCustomChampionships(files: File[]): Promise<void> {
    const carsFile = files.find((file) => file.name === 'cars.csv');
    const championshipsFile = files.find((file) => file.name === 'championships.csv');
    const eventsFile = files.find((file) => file.name === 'events.csv');
    const teamsFile = files.find((file) => file.name === 'teams.csv');

    if (!carsFile || !championshipsFile || !eventsFile || !teamsFile) {
      throw new Error('Missing required files');
    }

    const [carsText, championshipsText, eventsText, teamsText] = await Promise.all([
      carsFile.text(),
      championshipsFile.text(),
      eventsFile.text(),
      teamsFile.text(),
    ]);

    const cars = this.csvParser.parseCars(carsText);
    const championships = this.csvParser.parseChampionships(championshipsText);
    const events = this.csvParser.parseEvents(eventsText);
    const teams = this.csvParser.parseTeams(teamsText);

    await this.dbLoader.loadDataIntoDb(cars, championships, events, teams);
  }
}

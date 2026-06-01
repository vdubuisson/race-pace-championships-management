import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap } from 'rxjs';
import { CsvParser } from '../csv-parser/csv-parser';
import { DbLoader } from '../db-loader/db-loader';

@Injectable({ providedIn: 'root' })
export class CsvImporter {
  private readonly csvParser = inject(CsvParser);
  private readonly dbLoader = inject(DbLoader);

  importCustomChampionships(files: File[]): Observable<void> {
    return of(files).pipe(
      map((files) => {
        const carsFile = files.find((file) => file.name === 'cars.csv');
        const championshipsFile = files.find((file) => file.name === 'championships.csv');
        const eventsFile = files.find((file) => file.name === 'events.csv');
        const teamsFile = files.find((file) => file.name === 'teams.csv');

        if (!carsFile || !championshipsFile || !eventsFile || !teamsFile) {
          throw new Error('Missing required files');
        }

        return { carsFile, championshipsFile, eventsFile, teamsFile };
      }),
      switchMap(({ carsFile, championshipsFile, eventsFile, teamsFile }) =>
        from(
          Promise.all([
            carsFile.text(),
            championshipsFile.text(),
            eventsFile.text(),
            teamsFile.text(),
          ]),
        ),
      ),
      map(([carsText, championshipsText, eventsText, teamsText]) => {
        const cars = this.csvParser.parseCars(carsText);
        const championships = this.csvParser.parseChampionships(championshipsText);
        const events = this.csvParser.parseEvents(eventsText);
        const teams = this.csvParser.parseTeams(teamsText);

        return { cars, championships, events, teams };
      }),
      switchMap(({ cars, championships, events, teams }) =>
        from(this.dbLoader.loadChampionshipsIntoDb({ cars, championships, events, teams })),
      ),
    );
  }
}

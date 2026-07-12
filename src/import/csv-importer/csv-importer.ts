import { inject, Service } from '@angular/core';
import JSZip from '@progress/jszip-esm';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { CsvParser } from '../csv-parser/csv-parser';
import { DbLoader } from '../db-loader/db-loader';

type FileList = {
  carsFile?: Blob;
  championshipsFile?: Blob;
  driversFile?: Blob;
  eventsFile?: Blob;
  teamsFile?: Blob;
};

const EMPTY_DRIVERS_FILE =
  'name,surname,championship_name,category,team_name,end_year,expected_standing,team_loyalty,country,dob,elo,race_skill,qualifying_skill,aggression,defending,stamina,consistency,start_reactions,wet_skill,tyre_management,fuel_management,blue_flag_conceding,weather_tyre_changes,avoidance_of_mistakes,avoidance_of_forced_mistakes,setup_downforce,setup_downforce_randomness';

@Service()
export class CsvImporter {
  private readonly csvParser = inject(CsvParser);
  private readonly dbLoader = inject(DbLoader);

  importCustomChampionships(files: File[]): Observable<void> {
    return of(files).pipe(
      switchMap((files) => {
        if (files.length === 1 && files[0].name.endsWith('.zip')) {
          return from(this.openZipFile(files[0]));
        } else {
          return of(this.getFileList(files));
        }
      }),
      tap((fileList) => this.checkRequiredFiles(fileList)),
      switchMap(({ carsFile, championshipsFile, driversFile, eventsFile, teamsFile }) => {
        return from(
          Promise.all([
            carsFile!.text(),
            championshipsFile!.text(),
            driversFile?.text() ?? Promise.resolve(EMPTY_DRIVERS_FILE),
            eventsFile!.text(),
            teamsFile!.text(),
          ]),
        );
      }),
      map(([carsText, championshipsText, driversText, eventsText, teamsText]) => {
        const cars = this.csvParser.parseCars(carsText);
        const championships = this.csvParser.parseChampionships(championshipsText);
        const drivers = this.csvParser.parseDrivers(driversText);
        const events = this.csvParser.parseEvents(eventsText);
        const teams = this.csvParser.parseTeams(teamsText);

        return { cars, championships, drivers, events, teams };
      }),
      switchMap(({ cars, championships, drivers, events, teams }) =>
        from(
          this.dbLoader.loadChampionshipsIntoDb({ cars, championships, drivers, events, teams }),
        ),
      ),
    );
  }

  private getFileList(files: File[]): FileList {
    const fileList: FileList = {};
    for (const file of files) {
      switch (file.name) {
        case 'cars.csv':
          fileList.carsFile = file;
          break;
        case 'championships.csv':
          fileList.championshipsFile = file;
          break;
        case 'drivers.csv':
          fileList.driversFile = file;
          break;
        case 'events.csv':
          fileList.eventsFile = file;
          break;
        case 'teams.csv':
          fileList.teamsFile = file;
          break;
      }
    }
    return fileList;
  }

  private async openZipFile(file: File): Promise<FileList> {
    const fileList: FileList = {};
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);

    for (const [fileName, zipEntry] of Object.entries(zipContent.files)) {
      if (
        !zipEntry.dir &&
        ['cars.csv', 'championships.csv', 'drivers.csv', 'events.csv', 'teams.csv'].includes(
          fileName,
        )
      ) {
        const fileContent = await zipEntry.async('blob');
        switch (fileName) {
          case 'cars.csv':
            fileList.carsFile = fileContent;
            break;
          case 'championships.csv':
            fileList.championshipsFile = fileContent;
            break;
          case 'drivers.csv':
            fileList.driversFile = fileContent;
            break;
          case 'events.csv':
            fileList.eventsFile = fileContent;
            break;
          case 'teams.csv':
            fileList.teamsFile = fileContent;
            break;
        }
      }
    }

    return fileList;
  }

  private checkRequiredFiles(fileList: FileList): void {
    const missingFiles = [];
    if (!fileList.carsFile) missingFiles.push('cars.csv');
    if (!fileList.championshipsFile) missingFiles.push('championships.csv');
    if (!fileList.eventsFile) missingFiles.push('events.csv');
    if (!fileList.teamsFile) missingFiles.push('teams.csv');

    if (missingFiles.length > 0) {
      throw new Error(`Missing required files: ${missingFiles.join(', ')}`);
    }
  }
}

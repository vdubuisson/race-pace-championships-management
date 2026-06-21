import { inject, Injectable } from '@angular/core';
import { from, map, Observable, of, switchMap, tap } from 'rxjs';
import { CsvParser } from '../csv-parser/csv-parser';
import { DbLoader } from '../db-loader/db-loader';
import JSZip from '@progress/jszip-esm';

type FileList = {
  carsFile?: Blob;
  championshipsFile?: Blob;
  eventsFile?: Blob;
  teamsFile?: Blob;
};

@Injectable({ providedIn: 'root' })
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
      switchMap(({ carsFile, championshipsFile, eventsFile, teamsFile }) => {
        return from(
          Promise.all([
            carsFile!.text(),
            championshipsFile!.text(),
            eventsFile!.text(),
            teamsFile!.text(),
          ]),
        );
      }),
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
        ['cars.csv', 'championships.csv', 'events.csv', 'teams.csv'].includes(fileName)
      ) {
        const fileContent = await zipEntry.async('blob');
        switch (fileName) {
          case 'cars.csv':
            fileList.carsFile = fileContent;
            break;
          case 'championships.csv':
            fileList.championshipsFile = fileContent;
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

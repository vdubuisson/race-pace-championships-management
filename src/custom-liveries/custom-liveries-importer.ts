import { CustomLiveryRepository } from '@/db/custom-livery-repository';
import { CustomLivery } from '@/shared/models/livery';
import { Service, inject } from '@angular/core';
import JSZip, { JSZipObject } from '@progress/jszip-esm';
import { firstValueFrom } from 'rxjs';

const XML_FILE_REGEX = /^.*Vehicles\/Textures\/CustomLiveries\/Overrides\/([^\/]+)\/[^\/]+\.xml$/m;

@Service()
export class CustomLiveriesImporter {
  private readonly customLiveryRepository = inject(CustomLiveryRepository);

  async importZipFiles(files: File[]): Promise<void> {
    const zip = new JSZip();

    const customLiveries: CustomLivery[] = [];

    for (const file of files) {
      const zipContent = await zip.loadAsync(file);
      const xmlFiles = Object.entries(zipContent.files).filter(
        ([fileName, entry]) => !entry.dir && fileName.endsWith('.xml'),
      );

      for (const [fileName, entry] of xmlFiles) {
        const match = fileName.match(XML_FILE_REGEX);
        if (match) {
          const liveries = await this.parseXmlFile(match[1], entry);
          customLiveries.push(...liveries);
        }
      }
    }

    this.checkConflictsInImport(customLiveries);
    await this.checkConflictsWithDatabase(customLiveries);

    await this.customLiveryRepository.addAll(customLiveries);
  }

  async parseXmlFile(folderName: string, fileObject: JSZipObject): Promise<CustomLivery[]> {
    const xmlContent = await fileObject.async('text');

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'application/xml');

    return Array.from(xmlDoc.querySelectorAll('LIVERY_OVERRIDE'))
      .map((el) => ({
        livery_id: parseInt(el.getAttribute('LIVERY') || ''),
        livery_name: el.getAttribute('NAME'),
      }))
      .filter((livery) => livery.livery_id && livery.livery_name)
      .map((livery) => ({
        folder_name: folderName,
        livery_id: livery.livery_id as number,
        livery_name: livery.livery_name as string,
      }));
  }

  checkConflictsInImport(customLiveries: CustomLivery[]): void {
    const conflicts = customLiveries.reduce((acc, livery, index, arr) => {
      const duplicate = arr.find(
        (other, otherIndex) =>
          otherIndex !== index &&
          other.folder_name === livery.folder_name &&
          other.livery_id === livery.livery_id,
      );
      if (duplicate) {
        acc.push(livery);
      }
      return acc;
    }, [] as CustomLivery[]);

    if (conflicts.length > 0) {
      throw new Error('Conflicting liveries found in your imports: ' + JSON.stringify(conflicts));
    }
  }

  async checkConflictsWithDatabase(customLiveries: CustomLivery[]): Promise<void> {
    const dbCustomLiveries = await firstValueFrom(
      this.customLiveryRepository.getAllCustomLiveries(),
    );
    const conflicts = customLiveries.filter((livery) =>
      dbCustomLiveries.some(
        (dbLivery) =>
          dbLivery.folder_name === livery.folder_name && dbLivery.livery_id === livery.livery_id,
      ),
    );
    if (conflicts.length > 0) {
      throw new Error(
        'Conflicting liveries found with the already loaded ones: ' + JSON.stringify(conflicts),
      );
    }
  }
}

import { VersionRepository } from '@/db/version-repository';
import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';

@Service()
export default class VersionChecker {
  private readonly versionRepository = inject(VersionRepository);
  private readonly http = inject(HttpClient);

  private readonly currentRemoteVersion = signal(0);

  needToImportBaseResources(): Observable<boolean> {
    const localVersion = this.versionRepository.getLocalBaseResourcesVersion();
    return this.getRemoteBaseResourcesVersion().pipe(
      tap((remoteVersion) => this.currentRemoteVersion.set(remoteVersion)),
      map((remoteVersion) => remoteVersion > localVersion),
    );
  }

  setLocalBaseResourcesVersion(): void {
    if (this.currentRemoteVersion() > 0) {
      this.versionRepository.setLocalBaseResourcesVersion(this.currentRemoteVersion());
    }
  }

  private getRemoteBaseResourcesVersion(): Observable<number> {
    return this.http
      .get(`resources/base/version.txt`, { responseType: 'text' })
      .pipe(map((text) => parseInt(text)));
  }
}

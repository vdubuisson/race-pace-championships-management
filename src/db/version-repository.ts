import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VersionRepository {
  private readonly BASE_RESOURCES_VERSION_KEY = 'baseResourcesVersion';

  getLocalBaseResourcesVersion(): number {
    return parseInt(localStorage.getItem(this.BASE_RESOURCES_VERSION_KEY) ?? '0');
  }

  setLocalBaseResourcesVersion(version: number): void {
    localStorage.setItem(this.BASE_RESOURCES_VERSION_KEY, version.toString());
  }
}

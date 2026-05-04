import { inject, Injectable } from "@angular/core";
import { Team } from "../resources/models/team";
import { AppDatabase } from "./app-database";
import { ResourceLoader } from "../resources/resource-loader";
import { firstValueFrom, from, Observable } from "rxjs";
import { liveQuery } from "dexie";

@Injectable({ providedIn: 'root' })
export class TeamRepository {
  private readonly store = inject(AppDatabase).teams;
  private readonly resourceLoader = inject(ResourceLoader);

  async initialize(): Promise<void> {
    const count = await this.store.count();
    if (count === 0) {
      const teams = await firstValueFrom(this.resourceLoader.loadTeams());
      await this.store.bulkAdd(teams);
    }
  }

  getAllTeams(): Observable<Team[]> {
    return from(liveQuery(() => this.store.toArray()));
  }

  async getTeamById(id: number): Promise<Team | undefined> {
    return this.store.get(id);
  }

  async getTeamByName(name: string): Promise<Team | undefined> {
    return this.store.where('name').equals(name).first();
  }

  async addTeam(team: Team): Promise<void> {
    await this.store.add(team);
  }

  async updateTeam(id: number, team: Partial<Team>): Promise<void> {
    await this.store.update(id, team);
  }
}

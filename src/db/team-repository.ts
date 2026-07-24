import { Team } from '@/shared/models/team';
import { inject, Service } from '@angular/core';
import { AppDatabase } from './app-database';
import { from, Observable } from 'rxjs';
import { liveQuery } from 'dexie';

@Service()
export class TeamRepository {
  readonly store = inject(AppDatabase).teams;

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

  async deleteTeam(id: number): Promise<void> {
    await this.store.delete(id);
  }
}

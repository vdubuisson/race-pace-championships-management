import { Team } from '@/shared/models/team';
import { inject, Injectable } from '@angular/core';
import { AppDatabase } from './app-database';

@Injectable({ providedIn: 'root' })
export class TeamRepository {
  private readonly store = inject(AppDatabase).teams;

  async getAllTeams(): Promise<Team[]> {
    return this.store.toArray();
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

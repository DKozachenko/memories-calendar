import { Injectable } from '@angular/core';
import { IDateQuantitativeDataMap } from '../models/interfaces';

@Injectable()
export class StoreService {
  private directory: string | null = null;
  private eventsMap: IDateQuantitativeDataMap | null = null;

  public updateDirectory(value: string): void {
    this.directory = value;
  }

  public updateEventsMap(value: IDateQuantitativeDataMap): void {
    this.eventsMap = value;
  }

  public getDirectory(): string | null {
    return this.directory;
  }

  public getEventsMap(): IDateQuantitativeDataMap | null {
    return this.eventsMap;
  }
}

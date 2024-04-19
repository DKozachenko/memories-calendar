import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IDateQuantitativeDataMap } from '../models/interfaces';

// TODO: сигналы?
@Injectable()
export class StoreService {
  private directory: string | null = null;
  private eventsMap: IDateQuantitativeDataMap | null = null;

  private directory$: Subject<string> = new Subject<string>();
  public directoryObs$: Observable<string> = this.directory$.asObservable();

  private eventsMap$: Subject<IDateQuantitativeDataMap> = new Subject<IDateQuantitativeDataMap>();
  public eventsMapObs$: Observable<IDateQuantitativeDataMap> = this.eventsMap$.asObservable();

  public updateDirectory(value: string): void {
    this.directory$.next(value);
    this.directory = value;
  }

  public updateEventsMap(value: IDateQuantitativeDataMap): void {
    this.eventsMap$.next(value);
    this.eventsMap = value;
  }

  public getDirectory(): string | null {
    return this.directory;
  }

  public getEventsMap(): IDateQuantitativeDataMap | null {
    return this.eventsMap;
  }
}

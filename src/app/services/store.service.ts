import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { IEventsMap } from '../models/interfaces';

@Injectable()
export class StoreService {
  private directory: string = '';
  private eventsMap: IEventsMap | null = null;

  private directory$: Subject<string> = new Subject<string>();
  public directoryObs$: Observable<string> = this.directory$.asObservable();

  private eventsMap$: Subject<IEventsMap> = new Subject<IEventsMap>();
  public eventsMapObs$: Observable<IEventsMap> = this.eventsMap$.asObservable();

  public updateDirectory(value: string): void {
    this.directory$.next(value);
    this.directory = value;
  }

  public updateEventsMap(value: IEventsMap): void {
    this.eventsMap$.next(value);
    this.eventsMap = value;
  }

  public getDirectory(): string {
    return this.directory;
  }

  public getEventsMap(): IEventsMap | null {
    return this.eventsMap;
  }
}

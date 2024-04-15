import { Injectable, inject } from '@angular/core';
import { EventInput } from '@fullcalendar/core';
import { CRYPTO } from '@ng-web-apis/common';
import randomColor from 'randomcolor';

@Injectable()
export class EventBuildService {
  private readonly crypto: Crypto = inject(CRYPTO);

  private createEvent(date: string): EventInput {
    return {
      id: this.crypto.randomUUID(),
      date: new Date(date),
      color: randomColor(),
    };
  }

  public createPhotosEvent(date: string, photosNumber: number): EventInput {
    return {
      ...this.createEvent(date),
      title: `${photosNumber} фото`,
    };
  }

  public createVideosEvent(date: string, videosNumber: number): EventInput {
    return {
      ...this.createEvent(date),
      title: `${videosNumber} видео`,
    };
  }
}

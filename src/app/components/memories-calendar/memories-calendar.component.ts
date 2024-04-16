import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  LOCALE_ID,
  OnInit,
  inject,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import { TuiAlertService, TuiDialogModule, TuiDialogService } from '@taiga-ui/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable, retry, takeUntil } from 'rxjs';
import { GetEventsDataModalComponent } from '../get-events-data-modal/get-events-data-modal.component';
import { IEventsMap } from '../../models/interfaces';
import { CommandService, EventBuildService, StoreService } from '../../services';
import { Command } from '../../models/enums';

@Component({
  selector: 'app-memories-calendar',
  standalone: true,
  imports: [FullCalendarModule, TuiDialogModule, GetEventsDataModalComponent],
  providers: [TuiDestroyService],
  templateUrl: './memories-calendar.component.html',
  styleUrl: './memories-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoriesCalendarComponent implements OnInit {
  private readonly localeId: string = inject(LOCALE_ID);
  private readonly dialogService: TuiDialogService = inject(TuiDialogService);
  private readonly alertService: TuiAlertService = inject(TuiAlertService);
  private readonly injector: Injector = inject(Injector);
  private readonly destroyService: TuiDestroyService = inject(TuiDestroyService);
  private readonly eventBuilderService: EventBuildService = inject(EventBuildService);
  private readonly commandService: CommandService = inject(CommandService);
  private readonly storeService: StoreService = inject(StoreService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  private getEventsDataModal: Observable<IEventsMap> = this.dialogService.open<IEventsMap>(
    new PolymorpheusComponent(GetEventsDataModalComponent, this.injector),
    {
      closeable: false,
      dismissible: false,
      label: 'Выберите папку с файлами',
    },
  );

  public calendarOptions!: CalendarOptions;

  public ngOnInit(): void {
    this.getEventsDataModal.pipe(takeUntil(this.destroyService)).subscribe({
      next: (data: IEventsMap) => {
        this.storeService.updateEventsMap(data);
        this.calendarOptions = this.getCalendarOptions(data);
        this.cdr.markForCheck();
      },
      error: (err: Error) =>
        this.alertService.open(err, { label: 'Ошибка', status: 'error', autoClose: true }).subscribe(),
    });
  }

  private getCalendarOptions(getEventsData: IEventsMap): CalendarOptions {
    const staticOptions: CalendarOptions = {
      plugins: [dayGridPlugin, interactionPlugin],
      headerToolbar: {
        left: 'prev today',
        center: 'title',
        right: 'next',
      },
      // 1rem - вертикальный отступ
      height: 'calc(100vh - 1rem - 1rem)',
      expandRows: true,
      initialView: 'dayGridMonth',
      weekends: true,
      displayEventTime: false,
      locale: this.localeId,
      locales: [ruLocale],
      firstDay: 1,
      dateClick: this.openDayMemoriesModal.bind(this),
    };

    return {
      ...staticOptions,
      events: this.buildEvents(getEventsData),
    };
  }

  private buildEvents(data: IEventsMap): EventInput[] {
    const result: EventInput[] = [];

    for (const [date, quantitativeData] of Object.entries(data)) {
      if (quantitativeData.videos_number > 0) {
        const videosEvent: EventInput = this.eventBuilderService.createVideosEvent(
          date,
          quantitativeData.videos_number,
        );
        result.push(videosEvent);
      }

      if (quantitativeData.photos_number > 0) {
        const photosEvent: EventInput = this.eventBuilderService.createPhotosEvent(
          date,
          quantitativeData.photos_number,
        );
        result.push(photosEvent);
      }
    }

    return result;
  }

  private openDayMemoriesModal(day: DateClickArg): void {
    const eventsMap: IEventsMap | null = this.storeService.getEventsMap();
    if (!eventsMap) {
      return;
    }

    if (!eventsMap[day.dateStr]) {
      this.alertService
        .open('На эту дату файлы не найдены', { label: 'Предупреждение', status: 'warning', autoClose: true })
        .subscribe();
      return;
    }

    const path: string = this.storeService.getDirectory();
    this.commandService
      .execute<string[], { path: string; date: string }>(Command.GET_EVENT_FILENAMES, { path, date: day.dateStr })
      .pipe(takeUntil(this.destroyService))
      .subscribe({
        next: (data: string[]) => {
          console.warn(data);
        },
        error: (err: string) => {
          console.error('Ошибка при получении данных о событии: ', err);
          this.alertService.open(err, { label: 'Ошибка', status: 'error', autoClose: true }).subscribe();
        },
      });
  }
}

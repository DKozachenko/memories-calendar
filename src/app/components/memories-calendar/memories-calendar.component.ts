import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Injector,
  LOCALE_ID,
  OnInit,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import multiMonthPlugin from '@fullcalendar/multimonth';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import { TuiAlertService, TuiDialogModule, TuiDialogService } from '@taiga-ui/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { FileData } from '@bindings/file-data.type';
import { Observable, finalize, takeUntil } from 'rxjs';
import { IDateQuantitativeDataMap } from '../../models/interfaces';
import { CommandService, EventBuildService, StoreService } from '../../services';
import { Command } from '../../models/enums';
import { GetEventsDataModalComponent } from '../get-events-data-modal/get-events-data-modal.component';
import { FilesCarouselModalComponent } from '../files-carousel-modal/files-carousel-modal.component';
import { BackdropComponent } from '../backdrop/backdrop.component';

@Component({
  selector: 'app-memories-calendar',
  standalone: true,
  imports: [
    FullCalendarModule,
    TuiDialogModule,
    GetEventsDataModalComponent,
    FilesCarouselModalComponent,
    BackdropComponent,
  ],
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

  public calendarOptions: WritableSignal<CalendarOptions | undefined> = signal<CalendarOptions | undefined>(undefined);
  public loading: WritableSignal<boolean> = signal<boolean>(false);

  public ngOnInit(): void {
    this.openGetEventsDataModal();
  }

  private getEventsDataModal(): Observable<IDateQuantitativeDataMap> {
    const isClosable: boolean = !!this.storeService.getDirectory();

    return this.dialogService.open<IDateQuantitativeDataMap>(
      new PolymorpheusComponent(GetEventsDataModalComponent, this.injector),
      {
        closeable: isClosable,
        dismissible: false,
        label: 'Выберите папку с файлами',
      },
    );
  }

  private openGetEventsDataModal(): void {
    // TODO: возможно, получение будет слишком долгим и нужен будет лоадер, но нужен тест на проде
    this.getEventsDataModal()
      .pipe(takeUntil(this.destroyService))
      .subscribe({
        next: (data: IDateQuantitativeDataMap) => {
          this.storeService.updateEventsMap(data);
          this.calendarOptions.set(this.getCalendarOptions(data));
          this.cdr.markForCheck();
        },
        error: (err: Error) =>
          this.alertService.open(err, { label: 'Ошибка', status: 'error', autoClose: true }).subscribe(),
      });
  }

  private getCalendarOptions(getEventsData: IDateQuantitativeDataMap): CalendarOptions {
    const staticOptions: CalendarOptions = {
      plugins: [multiMonthPlugin, interactionPlugin],
      customButtons: {
        changeDirectoryButton: {
          text: 'Сменить директорию',
          click: () => {
            this.openGetEventsDataModal();
          },
        },
      },
      headerToolbar: {
        left: 'prev today',
        center: 'title',
        right: 'changeDirectoryButton next',
      },
      // 1rem - вертикальный отступ
      height: 'calc(100vh - 1rem - 1rem)',
      expandRows: true,
      initialView: 'multiMonthYear',
      multiMonthMaxColumns: 2,
      weekends: true,
      displayEventTime: false,
      locale: this.localeId,
      locales: [ruLocale],
      firstDay: 1,
      eventClick: (event: EventClickArg) => {
        if (!event.event.start) {
          return;
        }
        const dateStr: string = this.parseDateFromDateObj(event.event.start);
        this.openDayMemoriesModal(dateStr);
      },
      dateClick: (day: DateClickArg) => {
        const dateStr = day.dateStr;
        this.openDayMemoriesModal(dateStr);
      },
    };

    return {
      ...staticOptions,
      events: this.buildEvents(getEventsData),
    };
  }

  private buildEvents(data: IDateQuantitativeDataMap): EventInput[] {
    const result: EventInput[] = [];

    for (const [date, quantitativeData] of Object.entries(data)) {
      if (quantitativeData.videosNumber > 0) {
        const videosEvent: EventInput = this.eventBuilderService.createVideosEvent(date, quantitativeData.videosNumber);
        result.push(videosEvent);
      }
      if (quantitativeData.photosNumber > 0) {
        const photosEvent: EventInput = this.eventBuilderService.createPhotosEvent(date, quantitativeData.photosNumber);
        result.push(photosEvent);
      }
    }

    return result;
  }

  private parseDateFromDateObj(date: Date): string {
    return (
      date.getFullYear() +
      '-' +
      (date.getMonth() + 1).toString().padStart(2, '0') +
      '-' +
      date.getDate().toString().padStart(2, '0')
    );
  }

  private openDayMemoriesModal(dateStr: string): void {
    const eventsMap: IDateQuantitativeDataMap | null = this.storeService.getEventsMap();
    if (!eventsMap) {
      return;
    }

    if (!eventsMap[dateStr]) {
      this.alertService
        .open('На эту дату файлы не найдены', { label: 'Предупреждение', status: 'warning', autoClose: true })
        .subscribe();
      return;
    }

    const path: string | null = this.storeService.getDirectory();

    if (!path) {
      throw new Error('Нет текущей директории в стейте');
    }

    this.loading.set(true);
    this.commandService
      .execute<FileData[], { path: string; date: string }>(Command.GET_EVENT_FILES_DATA, { path, date: dateStr })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyService),
      )
      .subscribe({
        next: (data: FileData[]) => {
          this.dialogService
            .open<void>(new PolymorpheusComponent(FilesCarouselModalComponent, this.injector), {
              closeable: true,
              dismissible: false,
              size: 'm',
              label: 'Галерея',
              data,
            })
            .subscribe();
        },
        error: (err: string) => {
          console.error('Ошибка при получении данных о событии: ', err);
          this.alertService.open(err, { label: 'Ошибка', status: 'error', autoClose: true }).subscribe();
        },
      });
  }
}

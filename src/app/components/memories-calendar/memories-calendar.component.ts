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
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';
import { TuiDialogModule, TuiDialogService } from '@taiga-ui/core';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { PolymorpheusComponent } from '@tinkoff/ng-polymorpheus';
import { Observable, takeUntil } from 'rxjs';
import { RequestDirectoryModalComponent } from '../request-directory-modal/request-directory-modal.component';

@Component({
  selector: 'app-memories-calendar',
  standalone: true,
  imports: [FullCalendarModule, TuiDialogModule, RequestDirectoryModalComponent],
  providers: [TuiDestroyService],
  templateUrl: './memories-calendar.component.html',
  styleUrl: './memories-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoriesCalendarComponent implements OnInit {
  private readonly localeId: string = inject(LOCALE_ID);
  private readonly dialogService: TuiDialogService = inject(TuiDialogService);
  private readonly injector: Injector = inject(Injector);
  private readonly destroyService: TuiDestroyService = inject(TuiDestroyService);
  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  private requestDirectoryModal: Observable<string> = this.dialogService.open<string>(
    new PolymorpheusComponent(RequestDirectoryModalComponent, this.injector),
    {
      closeable: false,
      dismissible: false,
      label: 'Выберите папку с файлами',
    },
  );

  public calendarOptions!: CalendarOptions;

  public ngOnInit(): void {
    this.requestDirectoryModal.pipe(takeUntil(this.destroyService)).subscribe({
      next: (directory: string) => {
        console.warn('directory', directory);
        this.calendarOptions = this.getCalendarOptions();
        this.cdr.markForCheck();
      },
    });
  }

  private getCalendarOptions(): CalendarOptions {
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
      dateClick: this.openDayMemoriesModal,
    };

    return {
      ...staticOptions,
      events: [
        {
          id: '1',
          title: '5 фото',
          date: new Date(new Date().setDate(1)),
          color: 'red',
        },
        {
          id: '2',
          title: '2 видео',
          date: new Date(new Date().setDate(1)),
          color: 'green',
        },
      ],
    };
  }

  private openDayMemoriesModal(day: DateClickArg): void {
    console.log('day', day);
  }
}

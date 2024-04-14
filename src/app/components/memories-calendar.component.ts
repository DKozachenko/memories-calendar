import { ChangeDetectionStrategy, Component, LOCALE_ID, inject } from '@angular/core';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateClickArg } from '@fullcalendar/interaction';
import ruLocale from '@fullcalendar/core/locales/ru';

@Component({
  selector: 'app-memories-calendar',
  standalone: true,
  imports: [FullCalendarModule],
  templateUrl: './memories-calendar.component.html',
  styleUrl: './memories-calendar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MemoriesCalendarComponent {
  private readonly localeId: string = inject(LOCALE_ID);

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    headerToolbar: {
      left: 'prev today',
      center: 'title',
      right: 'next',
    },
    height: 'calc(100vh - 1rem - 1rem)',
    expandRows: true,
    initialView: 'dayGridMonth',
    weekends: true,
    displayEventTime: false,
    locale: this.localeId,
    locales: [ruLocale],
    firstDay: 1,
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
    dateClick: (day: DateClickArg) => console.log('test', day),
  };
}

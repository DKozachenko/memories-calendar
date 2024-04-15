import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertModule, TuiAlertService, TuiButtonModule, TuiDialogContext } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { CommandService } from '../../services';
import { Command } from '../../models/enums';
import { takeUntil } from 'rxjs';
import { TuiDestroyService } from '@taiga-ui/cdk';
import { IGetEventsData } from '../../models/interfaces';

@Component({
  selector: 'app-get-events-data-modal',
  standalone: true,
  imports: [TuiInputModule, TuiButtonModule, TuiAlertModule, FormsModule, ReactiveFormsModule],
  providers: [TuiDestroyService],
  templateUrl: './get-events-data-modal.component.html',
  styleUrl: './get-events-data-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetEventsDataModalComponent {
  private readonly context: TuiDialogContext<IGetEventsData> =
    inject<TuiDialogContext<IGetEventsData>>(POLYMORPHEUS_CONTEXT);
  private readonly commandService: CommandService = inject(CommandService);
  private readonly alertService: TuiAlertService = inject(TuiAlertService);
  private readonly destroyService: TuiDestroyService = inject(TuiDestroyService);

  readonly directoryControl = new FormControl(null, [Validators.required]);

  // TODO: мб валидатор для пути и можно еще хранить директории, которые зафейлились
  public submit(): void {
    const path: string = this.directoryControl.value!;
    this.commandService
      .execute<IGetEventsData, { path: string }>(Command.GET_EVENTS, { path })
      .pipe(takeUntil(this.destroyService))
      .subscribe({
        next: (data: IGetEventsData) => this.context.completeWith(data),
        error: (err: string) => {
          console.error('Ошибка при получении данных о событиях: ', err);
          this.alertService.open(err, { label: 'Ошибка', status: 'error', autoClose: true }).subscribe();
        },
      });
  }
}

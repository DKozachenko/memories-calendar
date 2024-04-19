import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertModule, TuiAlertService, TuiButtonModule, TuiDialogContext, TuiErrorModule } from '@taiga-ui/core';
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipeModule, TuiInputModule } from '@taiga-ui/kit';
import { TuiDestroyService, TuiAutoFocusModule } from '@taiga-ui/cdk';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { takeUntil } from 'rxjs';
import { CommandService, StoreService } from '../../services';
import { currentDirectoryValidator } from '../../validators';
import { Command } from '../../models/enums';
import { IDateQuantitativeDataMap } from '../../models/interfaces';

@Component({
  selector: 'app-get-events-data-modal',
  standalone: true,
  imports: [
    TuiInputModule,
    TuiButtonModule,
    TuiAlertModule,
    TuiAutoFocusModule,
    TuiFieldErrorPipeModule,
    TuiErrorModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
  ],
  providers: [
    TuiDestroyService,
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: 'Поле является обязательным',
        directoryAlreadyCurrent: (currentDirectory: string) => `Директория "${currentDirectory}" уже является текущей`,
      },
    },
  ],
  templateUrl: './get-events-data-modal.component.html',
  styleUrl: './get-events-data-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GetEventsDataModalComponent {
  private readonly context: TuiDialogContext<IDateQuantitativeDataMap> =
    inject<TuiDialogContext<IDateQuantitativeDataMap>>(POLYMORPHEUS_CONTEXT);
  private readonly commandService: CommandService = inject(CommandService);
  private readonly storeService: StoreService = inject(StoreService);
  private readonly alertService: TuiAlertService = inject(TuiAlertService);
  private readonly destroyService: TuiDestroyService = inject(TuiDestroyService);

  readonly directoryControl = new FormControl<string | null>(null, [
    Validators.required,
    currentDirectoryValidator(this.storeService),
  ]);

  // TODO: мб валидатор для пути и можно еще хранить директории, которые зафейлились
  public submit(): void {
    const path: string = this.directoryControl.value!;
    this.commandService
      .execute<IDateQuantitativeDataMap, { path: string }>(Command.GET_EVENTS, { path })
      .pipe(takeUntil(this.destroyService))
      .subscribe({
        next: (data: IDateQuantitativeDataMap) => {
          this.storeService.updateDirectory(path);
          this.context.completeWith(data);
        },
        error: (err: string) => {
          console.error('Ошибка при получении данных о событиях: ', err);
          this.alertService.open(err, { label: 'Ошибка', status: 'error', autoClose: true }).subscribe();
        },
      });
  }
}

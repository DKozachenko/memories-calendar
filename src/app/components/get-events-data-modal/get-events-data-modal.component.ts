import { ChangeDetectionStrategy, Component, WritableSignal, inject, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiAlertService, TuiButtonModule, TuiDialogContext, TuiErrorModule } from '@taiga-ui/core';
import { TUI_VALIDATION_ERRORS, TuiFieldErrorPipeModule, TuiInputModule } from '@taiga-ui/kit';
import { TuiDestroyService, TuiAutoFocusModule } from '@taiga-ui/cdk';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';
import { finalize, takeUntil } from 'rxjs';
import { CommandService, StoreService } from '../../services';
import { currentDirectoryValidator, filePathValidator } from '../../validators';
import { Command } from '../../models/enums';
import { IDateQuantitativeDataMap } from '../../models/interfaces';
import { BackdropComponent } from '../backdrop/backdrop.component';

@Component({
  selector: 'app-get-events-data-modal',
  standalone: true,
  imports: [
    TuiInputModule,
    TuiButtonModule,
    TuiAutoFocusModule,
    TuiFieldErrorPipeModule,
    TuiErrorModule,
    AsyncPipe,
    FormsModule,
    ReactiveFormsModule,
    BackdropComponent,
  ],
  providers: [
    TuiDestroyService,
    {
      provide: TUI_VALIDATION_ERRORS,
      useValue: {
        required: 'Поле является обязательным',
        directoryAlreadyCurrent: (currentDirectory: string) => `Директория "${currentDirectory}" уже является текущей`,
        incorrectFilePath: (currentPath: string) => `Текущий путь "${currentPath}" не является корректным`,
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

  public readonly directoryControl: WritableSignal<FormControl<string | null>> = signal<FormControl<string | null>>(
    new FormControl<string | null>(null, [
      Validators.required,
      currentDirectoryValidator(this.storeService),
      filePathValidator(),
    ]),
  );

  public readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  public submit(): void {
    const path: string = this.directoryControl().value!;

    this.loading.set(true);
    this.commandService
      .execute<IDateQuantitativeDataMap, { path: string }>(Command.GET_EVENTS, { path })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntil(this.destroyService),
      )
      .subscribe({
        next: (data: IDateQuantitativeDataMap) => {
          if (Object.keys(data).length === 0) {
            this.alertService
              .open('В указанной директории нет подходящих файлов', {
                label: 'Предупреждение',
                status: 'warning',
                autoClose: true,
              })
              .subscribe();
            return;
          }

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

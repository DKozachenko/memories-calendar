import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButtonModule, TuiDialogContext } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { POLYMORPHEUS_CONTEXT } from '@tinkoff/ng-polymorpheus';

@Component({
  selector: 'app-request-directory-modal',
  standalone: true,
  imports: [TuiInputModule, TuiButtonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './request-directory-modal.component.html',
  styleUrl: './request-directory-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestDirectoryModalComponent {
  private readonly context: TuiDialogContext<number> = inject<TuiDialogContext<number>>(POLYMORPHEUS_CONTEXT);

  readonly directoryControl = new FormControl(null, [Validators.required]);

  public submit(): void {
    this.context.completeWith(this.directoryControl.value!);
  }
}

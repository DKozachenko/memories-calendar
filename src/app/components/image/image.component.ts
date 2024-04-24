import { ChangeDetectionStrategy, Component, InputSignal, WritableSignal, input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButtonModule } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { TuiDestroyService, TuiMediaModule } from '@taiga-ui/cdk';

@Component({
  selector: 'app-image',
  standalone: true,
  imports: [TuiMediaModule, TuiButtonModule, TuiInputModule, FormsModule, ReactiveFormsModule],
  providers: [TuiDestroyService],
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageComponent {
  public mediaSrc: InputSignal<string> = input.required<string>();
  public name: InputSignal<string> = input.required<string>();
  public showSkeleton: WritableSignal<boolean> = signal<boolean>(true);
}

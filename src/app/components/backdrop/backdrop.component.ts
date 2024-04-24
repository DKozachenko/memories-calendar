import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { TuiLoaderModule, tuiLoaderOptionsProvider } from '@taiga-ui/core';
import { TuiPortalModule } from '@taiga-ui/cdk';

@Component({
  selector: 'app-backdrop',
  standalone: true,
  imports: [TuiLoaderModule, TuiPortalModule],
  providers: [
    tuiLoaderOptionsProvider({
      size: 'l',
      inheritColor: false,
      overlay: true,
    }),
  ],
  templateUrl: './backdrop.component.html',
  styleUrl: './backdrop.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackdropComponent {
  public show: InputSignal<boolean> = input.required<boolean>();
}

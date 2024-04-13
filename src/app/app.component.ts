import { TuiRootModule, TuiDialogModule, TuiAlertModule } from '@taiga-ui/core';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CommandService } from './services';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, TuiRootModule, TuiDialogModule, TuiAlertModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly commandService: CommandService = inject(CommandService);

  greetingMessage = 'dfsdfs';

  greet(event: SubmitEvent, name: string): void {
    event.preventDefault();

    this.commandService
      .execute<string, { name: string }>('greet', { name })
      .subscribe((value: string) => (this.greetingMessage = value));
  }
}

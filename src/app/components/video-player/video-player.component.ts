import { ChangeDetectionStrategy, Component, InputSignal, WritableSignal, input, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiButtonModule } from '@taiga-ui/core';
import { TuiInputModule } from '@taiga-ui/kit';
import { SECONDS_IN_MINUTE, TuiDestroyService, TuiMediaModule } from '@taiga-ui/cdk';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [TuiMediaModule, TuiButtonModule, TuiInputModule, FormsModule, ReactiveFormsModule],
  providers: [TuiDestroyService],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent {
  public sourceUrl: InputSignal<string> = input.required<string>();

  public currentTime: WritableSignal<number> = signal<number>(0);
  public paused: WritableSignal<boolean> = signal<boolean>(true);

  public get icon(): string {
    return this.paused() ? 'tuiIconPlayLarge' : 'tuiIconPauseLarge';
  }

  public getTime(time: number): string {
    const integer = Math.round(time || 0);
    const seconds = integer % SECONDS_IN_MINUTE;
    const minutes = (integer - seconds) / SECONDS_IN_MINUTE;
    const secondsString = String(seconds);
    const minutesString = String(minutes);
    const paddedSeconds = secondsString.length === 1 ? `0${secondsString}` : secondsString;
    const paddedMinutes = minutesString.length === 1 ? `0${minutesString}` : minutesString;

    return `${paddedMinutes}:${paddedSeconds}`;
  }

  public toggleState(): void {
    this.paused.update((value: boolean) => !value);
  }
}

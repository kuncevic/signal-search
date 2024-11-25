import { Component } from '@angular/core';
import { SearchComponent } from './search/search.component';

@Component({
  selector: 'app-root',
  imports: [SearchComponent],
  template: `
<!--    <img class="logo" src="./logo.png" width="5%" alt="Angular Consulting" />-->
    <app-search class="mat-elevation-z3" />
  `,
})
export class AppComponent {}


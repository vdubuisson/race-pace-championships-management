import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TuiButton, TuiLink, TuiTitle } from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  imports: [RouterLink, TuiAvatar, TuiHeader, TuiTitle, TuiButton, TuiCardLarge, TuiLink],
})
export class HomePage {}

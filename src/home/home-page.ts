import { Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { TuiTitle, TuiButton } from "@taiga-ui/core";
import { TuiHeader } from "@taiga-ui/layout";

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
  imports: [
    RouterLink,
    TuiHeader,
    TuiTitle,
    TuiButton
]
})
export class HomePage {}

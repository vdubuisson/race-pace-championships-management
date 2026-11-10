import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TuiTitle } from '@taiga-ui/core';
import { TuiAccordion, TuiConnected, TuiAvatar } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-guide-page',
  templateUrl: './guide-page.html',
  styleUrl: './guide-page.css',
  imports: [NgOptimizedImage, TuiAccordion, TuiAvatar, TuiConnected, TuiHeader, TuiTitle],
})
export class GuidePage {}

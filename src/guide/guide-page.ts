import { NgOptimizedImage } from '@angular/common';
import { Component } from '@angular/core';
import { TuiIcon, TuiLink, TuiTitle } from '@taiga-ui/core';
import { TuiAccordion, TuiAvatar, TuiChip, TuiConnected } from '@taiga-ui/kit';
import { TuiHeader } from '@taiga-ui/layout';

@Component({
  selector: 'app-guide-page',
  templateUrl: './guide-page.html',
  styleUrl: './guide-page.css',
  imports: [
    NgOptimizedImage,
    TuiAccordion,
    TuiAvatar,
    TuiChip,
    TuiConnected,
    TuiHeader,
    TuiIcon,
    TuiLink,
    TuiTitle,
  ],
})
export class GuidePage {}

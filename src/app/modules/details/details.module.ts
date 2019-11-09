import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { DetailsRoutingModule } from './details-routing.module';
import { ShareModule } from 'app/modules/share/share.module';

import { AppDetailComponent } from './app-detail.component';
import { DonateComponent } from './components/donate/donate.component';
import { DonorsComponent } from './components/donors/donors.component';
import { ScreenshotComponent } from './components/screenshot/screenshot.component';
import { StatementComponent } from './components/statement/statement.component';
import { AppCommentComponent } from './components/comment/app-comment.component';

@NgModule({
  declarations: [
    AppDetailComponent,
    DonateComponent,
    DonorsComponent,
    StatementComponent,
    ScreenshotComponent,
    AppCommentComponent,
  ],
  imports: [CommonModule, DetailsRoutingModule, ShareModule, FormsModule, ReactiveFormsModule],
})
export class DetailsModule {}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { publishReplay, refCount, switchMap, share, map, startWith } from 'rxjs/operators';

import { StoreService } from 'app/modules/client/services/store.service';
import { StoreJobType, StoreJobStatus } from 'app/modules/client/models/store-job-info';
import { ReminderService } from 'app/services/reminder.service';
import { NotifyService } from 'app/services/notify.service';
import { NotifyType } from 'app/services/notify.model';
import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { environment } from 'environments/environment';
import { SoftwareService, Source } from 'app/services/software.service';
import { SettingService } from 'app/services/settings.service';
import { DownloadTotalService } from 'app/services/download-total.service';
import { of } from 'rxjs';
import { CommentService } from './services/comment.service';

@Component({
  selector: 'dstore-app-detail',
  templateUrl: './app-detail.component.html',
  styleUrls: ['./app-detail.component.scss'],
})
export class AppDetailComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private softwareService: SoftwareService,
    private storeService: StoreService,
    private reminderService: ReminderService,
    private notifyService: NotifyService,
    private settingService: SettingService,
    private downloadTotalServer: DownloadTotalService,
    private comment: CommentService,
  ) {}
  crumbs = false;
  supportSignIn = environment.supportSignIn;
  adVisible$ = this.settingService.settings$.then(set => set.upyunBannerVisible);
  open = this.softwareService.open;

  StoreJobStatus = StoreJobStatus;
  StoreJobType = StoreJobType;
  SoftSource = Source;

  openURL = DstoreObject.openURL;
  pause = this.storeService.pauseJob;
  start = this.storeService.resumeJob;

  installCount$ = this.downloadTotalServer.installCount$.pipe(
    map(app => (parseInt(this.route.snapshot.params.id) === app.id ? 1 : 0)),
    startWith(0),
  );
  sourceCount$ = this.comment.sourceCount$.pipe(map(app => parseInt(app)));
  app$ = this.route.paramMap.pipe(
    switchMap(param => this.softwareService.list({ ids: [Number(param.get('id'))] }).then(softs => softs[0])),
    publishReplay(1),
    refCount(),
  );

  size$ = this.app$.pipe(
    switchMap(app => this.softwareService.size(app).then(m => m.get(app.id.toString()))),
    share(),
  );
  allowName$ = this.storeService.getAllowShowPackageName();

  ngOnInit() {}
  reminder(name: string, version: string) {
    this.reminderService.reminder(name, version).subscribe(
      () => {
        this.notifyService.success(NotifyType.Reminder);
      },
      () => {
        this.notifyService.error(NotifyType.Reminder);
      },
    );
  }
}

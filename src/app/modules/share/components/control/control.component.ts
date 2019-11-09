import { Component, OnInit, Input, Output, HostListener } from '@angular/core';
import { Software, SoftwareService } from 'app/services/software.service';
import { PackageService } from 'app/services/package.service';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { share, map, switchMap, pairwise, startWith, tap, first } from 'rxjs/operators';
import { JobService } from 'app/services/job.service';
import { trigger, animate, style, transition, keyframes } from '@angular/animations';
import { StoreJobInfo, StoreJobStatus } from 'app/modules/client/models/store-job-info';
import { BuyService } from 'app/services/buy.service';
import { UserAppsService } from 'app/services/user-apps.service';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'dstore-control',
  templateUrl: './control.component.html',
  styleUrls: ['./control.component.scss'],
  animations: [
    trigger('circle', [
      transition(
        ':enter',
        animate(
          200,
          keyframes([
            style({ opacity: 0, transform: 'translateX(100%)' }),
            style({ opacity: 1, transform: 'translateX(0)' }),
          ]),
        ),
      ),
      transition(
        ':leave',
        animate(
          200,
          keyframes([
            style({
              position: 'absolute',
              opacity: 1,
              transform: 'translateX(0)',
            }),
            style({
              position: 'absolute',
              opacity: 0,
              transform: 'translateX(100%)',
            }),
          ]),
        ),
      ),
    ]),
    trigger('button1', [
      transition(
        ':enter',
        animate(
          200,
          keyframes([
            style({
              opacity: 0.5,
              transform: 'translateX(-50%)',
            }),
            style({
              opacity: 1,
              transform: 'translateX(0)',
            }),
          ]),
        ),
      ),
      transition(
        ':leave',
        animate(
          200,
          keyframes([
            style({
              position: 'absolute',
              opacity: 1,
              transform: 'translateX(0)',
            }),
            style({
              position: 'absolute',
              opacity: 0.5,
              transform: 'translateX(-100%)',
            }),
          ]),
        ),
      ),
    ]),
  ],
})
export class ControlComponent implements OnInit {
  constructor(
    private softwareService: SoftwareService,
    private packageService: PackageService,
    private jobService: JobService,
    private buyService: BuyService,
    private userAppService: UserAppsService,
    private authService: AuthService,
  ) {}
  @Input() soft: Software;
  @Output() job$: Observable<any>;
  package$ = new BehaviorSubject(null);
  userAppIDs$ = this.userAppService.userAllApp$;
  JobStatus = StoreJobStatus;
  show = false;
  ngOnInit() {
    this.queryPackage();
    this.job$ = this.jobService.jobsInfo().pipe(
      map(jobs => jobs.find(job => job.names.includes(this.soft.name))),
      startWith(null),
      pairwise(),
      switchMap(async ([old, job]) => {
        setTimeout(() => (this.show = Boolean(job)));
        if (old && !job) {
          await this.queryPackage();
        }
        return job;
      }),
      share(),
    );
  }

  async queryPackage() {
    const pkg = await this.packageService
      .query({
        name: this.soft.name,
        localName: this.soft.info.name,
        packages: this.soft.info.packages,
      })
      .pipe(
        share(),
        first(),
      )
      .toPromise();
    this.package$.next(pkg);
  }

  openApp(e: Event) {
    this.softwareService.open(this.soft);
  }

  installApp(e: Event) {
    this.softwareService.install(this.soft);
  }

  buyApp(e: Event) {
    console.log(e);
    this.buyService.buyDialogShow$.next(this.soft);
  }

  trgger(e: Event, job: StoreJobInfo) {
    e.stopPropagation();
    if (job.status === this.JobStatus.paused || job.status === this.JobStatus.failed) {
      job.status = this.JobStatus.running;
      this.jobService.startJob(job.job);
    } else {
      job.status = this.JobStatus.paused;
      this.jobService.stopJob(job.job);
    }
  }
}

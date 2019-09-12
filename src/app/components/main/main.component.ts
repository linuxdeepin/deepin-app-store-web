import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'environments/environment';

import { DstoreObject } from 'app/modules/client/utils/dstore-objects';
import { ThemeService } from 'app/services/theme.service';
import { SearchService } from 'app/services/search.service';
import { SysFontService } from 'app/services/sys-font.service';
import { MenuService } from 'app/services/menu.service';
import { SoftwareService } from 'app/services/software.service';

@Component({
  selector: 'dstore-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private sysFontService: SysFontService,
    private menuService: MenuService,
    private searchService: SearchService,
    private softwareService: SoftwareService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.switchTheme();
    if (!environment.native) {
      return;
    }
    this.searchNavigate();
    this.switchFont();
    this.screenshotPreview();
    this.menuService.serve();
  }
  // switch theme dark or light
  switchTheme() {
    this.themeService.getTheme().subscribe(theme => {
      document.body.className = theme;
    });
  }
  // switch font family and font size
  switchFont() {
    this.sysFontService.fontChange$.subscribe(([fontFamily, fontSize]) => {
      const HTMLGlobal = document.querySelector('html');
      HTMLGlobal.style.fontFamily = fontFamily;
      HTMLGlobal.style.fontSize = fontSize + 'px';
    });
  }
  // preview software screenshot
  screenshotPreview() {
    DstoreObject.openOnlineImage().subscribe(src => {
      fetch(src)
        .then(resp => resp.blob())
        .then(blob => {
          return new Promise<string>(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        })
        .then(data => {
          DstoreObject.imageViewer(src, data.slice(data.indexOf(',') + 1));
        });
    });
  }
  // search navigate
  searchNavigate() {
    this.searchService.openApp$.subscribe(name => {
      this.router.navigate(['/list', 'keyword', name, name]);
    });
    this.searchService.openAppList$.subscribe(keyword => {
      this.router.navigate(['/list', 'keyword', keyword]);
    });
    this.searchService.requestComplement$.subscribe(async keyword => {
      let list = [];
      for (let offset = 0; list.length < 10; offset += 20) {
        const softs = await this.softwareService.list({ keyword, offset });
        if (softs.length === 0) {
          break;
        }
        list = list.concat(softs.map(soft => ({ name: soft.name, local_name: soft.info.name }))).slice(0, 10);
      }
      this.searchService.setComplementList(list);
    });
  }
}

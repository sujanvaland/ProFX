import { Component, OnInit } from '@angular/core';
import { ReportService } from '../../services/report.service';

@Component({
  templateUrl: 'deposithistory.component.html'
})
export class DepositHistoryComponent implements OnInit {

  constructor(private _reportService:ReportService) { }
  CustomerId:string = localStorage.getItem("CustomerId");
  DepositeData = [];

  ngOnInit(): void {
    let model = { CustomerId : this.CustomerId };
    this._reportService.Fundingreport(model)
    .subscribe(
      res => {
        this.DepositeData = res.data.Data;
        console.log(this.DepositeData);
      },
      err => console.log(err)
    )
  }

  isCollapsed: boolean = false;
  iconCollapse: string = 'icon-arrow-up';

  collapsed(event: any): void {
    // console.log(event);
  }

  expanded(event: any): void {
    // console.log(event);
  }

  toggleCollapse(): void {
    this.isCollapsed = !this.isCollapsed;
    this.iconCollapse = this.isCollapsed ? 'icon-arrow-down' : 'icon-arrow-up';
  }

}

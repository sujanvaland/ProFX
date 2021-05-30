import { Component } from '@angular/core';
import { LoginserviceService } from '../../services/loginservice.service';

@Component({
  templateUrl: 'signals.component.html'
})
export class SignalComponent {

  constructor(private loginservice:LoginserviceService) { }
  ProSignals = [];

  ngOnInit(): void {
    this.loginservice.GetProSignals()
    .subscribe(
      res => {
        this.ProSignals = res.data;
      },
      err => console.log(err)
    )
  }
}


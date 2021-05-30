import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'webinars-home',
  templateUrl: 'webinars.component.html'
})
export class WebinarsComponent  implements OnInit { 
  constructor(
    private router: Router) { }
  
  MobileMenu = false;
  ngOnInit (){
      
  }
   
  showMobileMenu(){
    this.MobileMenu = !this.MobileMenu;
  }
}

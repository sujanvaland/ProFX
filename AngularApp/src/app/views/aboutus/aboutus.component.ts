import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Import your library

import * as $ from 'jquery';

@Component({
  selector: 'aboutus-home',
  templateUrl: 'aboutus.component.html'
})
export class AboutUsComponent  implements OnInit { 
  constructor(
    private router: Router) { }
  
  MobileMenu = false;
  ngOnInit (){
      
  }
   
  showMobileMenu(){
    this.MobileMenu = !this.MobileMenu;
  }
}

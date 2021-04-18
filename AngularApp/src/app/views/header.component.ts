import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Import your library

import * as $ from 'jquery';

@Component({
  selector: 'header-home',
  templateUrl: 'header.component.html'
})
export class HeaderComponent  implements OnInit { 
  constructor(
    private router: Router) { }
  
  MobileMenu = false;
  ngOnInit (){
      
  }
   
  showMobileMenu(){
    this.MobileMenu = !this.MobileMenu;
  }
}

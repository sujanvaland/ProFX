import { Component,OnInit } from '@angular/core';
import { Router } from '@angular/router';
// Import your library

import * as $ from 'jquery';

@Component({
  selector: 'footer-home',
  templateUrl: 'footer.component.html'
})
export class FooterComponent  implements OnInit { 
  constructor(
    private router: Router) { }
  
  MobileMenu = false;
  ngOnInit (){
      
  }
   
  showMobileMenu(){
    this.MobileMenu = !this.MobileMenu;
  }
}

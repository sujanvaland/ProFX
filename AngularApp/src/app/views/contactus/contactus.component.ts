import { Component,OnInit } from '@angular/core';
import { FormGroup,FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
// Import your library

import * as $ from 'jquery';
import { CommonService } from '../../services/common.service';
import { ToastrService } from 'ngx-toastr';
@Component({
  selector: 'faq-home',
  templateUrl: 'contactus.component.html'
})
export class ContactUsComponent  implements OnInit { 
  constructor(private commonservice: CommonService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService) { }
 
  Managers =[]
  MobileMenu = false;
  contactUs: FormGroup;
submitted = false;

  ngOnInit (){
    this.contactUs =this.formBuilder.group({
      Fname: '',
      Lname:'',
      Email:'',
      Subject:'',
      Enquiry:''
    });
  }
   
  showMobileMenu(){
    this.MobileMenu = !this.MobileMenu;
  }

  onSubmit() {
    if(this.contactUs.value.Fname == ""){
      this.toastr.error("Enter First Name","Error");
      return;
    }
    if(this.contactUs.value.Lname == ""){
      this.toastr.error("Enter Last Name","Error");
      return;
    }
    if(this.contactUs.value.Email == ""){
      this.toastr.error("Enter Email","Error");
      return;
    }
    if(this.contactUs.value.Subject == ""){
      this.toastr.error("Enter Subject","Error");
      return;
    }
    if(this.contactUs.value.Enquiry == ""){
      this.toastr.error("Enter Message","Error");
      return;
    }
    this.commonservice.ContactUsNew(this.contactUs.value).subscribe();
  }
}

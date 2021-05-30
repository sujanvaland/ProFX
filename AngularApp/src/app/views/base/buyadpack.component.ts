import { Component ,OnInit } from '@angular/core';
import { FormGroup,FormBuilder,Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { RevShareService } from '../../services/revshare.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import * as $ from 'jquery';
import { CustomerService } from '../../services/customer.service';
@Component({
  selector: 'buyadpack',
  templateUrl: 'buyadpack.component.html'
})
export class BuyAdPackComponent  implements OnInit {

stName: FormGroup;
CustomerId = localStorage.getItem("CustomerId");
Email = "";
Phone = "";
confirm = false;
submitted = false;
PlanId = 1;
PlanName = "";
Name = "";
UserList = [];
AmountInvested = 0;
Total:number=0;
Plans = [] as any;
plan = {} as any;
constructor(
  private formBuilder: FormBuilder,
  private toastr:ToastrService,
  private revshare:RevShareService,
  private customerservice: CustomerService,
  private router: Router) { }

    ngOnInit (){
      this.stName = this.formBuilder.group({
        NoOfPack: [''],
      });

        if(!environment.AllowAdPack){
          this.toastr.info("Purchase is diabled till launch date");
        }
        $('.loaderbo').show(); 
        

      this.customerservice.GetPlanDetail(this.CustomerId).subscribe(result =>{
        this.plan = result.data;
      })
      
        this.revshare.GetPlan().subscribe(res=>{
          this.Plans = res?.data;
          $('.loaderbo').hide();
        })


    }

    onSubmit(planId) {
      if(planId > 0){
        if(confirm("Are you sure you want to make this purchase")) {          
          let CustomerPlanModel = {
            CustomerId : this.CustomerId,
            PlanId : planId,
            NoOfPosition:1
          }
          $('.loaderbo').show();       
          this.revshare.BuyShare(CustomerPlanModel).subscribe(res =>{                
            if(res.Message == "success"){
              this.toastr.success("Your purchase was successful");
              this.stName.value.NoOfPack = 0;
              this.Total = 0;
              this.router.navigate(['/dashboard']);
              
            }
            else{
              this.toastr.error(res.Message);
            }    
            $('.loaderbo').hide();            
          },
          err => {
            if(err.status == 401){
              localStorage.clear();
              $('.loaderbo').hide();
              this.router.navigate(['/login']);
            }
            else{
              this.toastr.error("Something went wrong, contact support","Error")
            }                      
          })
        }
      }else{
        this.toastr.error("Please select package","Error")
      }
        
      
     }
}

import { Component ,OnInit, ViewChild } from '@angular/core';
import { FormGroup,FormBuilder,Validators, NgForm } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ToastrService } from 'ngx-toastr';
import { RevShareService } from '../../services/revshare.service';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import * as $ from 'jquery';
import { CustomerService } from '../../services/customer.service';
import { MatrixService } from '../../services/matrix.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
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
MerchantAcc:string = "";
CurrencyCode:string = "USD";
FinalAmount:number;
PaymentMemo:string = "ProFx Signals Purchase";
ipn_url:string = '';
TransactionId:number = 0;
showform: boolean = true;
constructor(
  private formBuilder: FormBuilder,
  private toastr:ToastrService,
  private revshare:RevShareService,
  private customerservice: CustomerService,
  private matrixservice: MatrixService,
  private router: Router) { }
  @ViewChild('myForm') ngForm: NgForm;
  @ViewChild('infoModal') public infoModal: ModalDirective;
    ngOnInit (){
      this.CurrencyCode = (localStorage.getItem("CurrencyCode") == null) ? "USD" : localStorage.getItem("CurrencyCode");
      this.ipn_url = environment.siteUrl + '/IPNHandler';
  
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
    
    onSubmit(plan) {
      this.submitted = true;
      if(!environment.AllowFund){
        this.toastr.info("Purchase is diabled till launch date");
        return;
      }
      
      let transactionModel ={
        Amount : (this.plan?.Id > 0) ? plan.MinimumInvestment - this.plan.MinimumInvestment : plan.MinimumInvestment,
        CustomerId : this.CustomerId,
        FinalAmount :  (this.plan?.Id > 0) ? plan.MinimumInvestment - this.plan.MinimumInvestment : plan.MinimumInvestment,
        NoOfPosition : 1,
        RefId : plan.Id,
        ProcessorId : 0,
        TranscationTypeId : 1
      }
      this.matrixservice.AddTransaction(transactionModel).subscribe(
        res => {
          if(res.Message){
              this.TransactionId = res.data.Id;
              this.FinalAmount = plan.MinimumInvestment;
              this.MerchantAcc = environment.coinPaymentMerAcc;
              this.showform = false;
              //this.infoModal.show();
          }
        },
        err => {
          if(err.status == 401){
            localStorage.clear();
            this.router.navigate(['/login']);
          }
          else{
            this.toastr.error("Something went wrong, contact support","Error")
          }
        }
      );
  }
  onReset() {
    this.submitted = false;
    this.showform = true;
}
    // onSubmit(planId) {
    //   if(planId > 0){
    //     if(confirm("Are you sure you want to make this purchase")) {          
    //       let CustomerPlanModel = {
    //         CustomerId : this.CustomerId,
    //         PlanId : planId,
    //         NoOfPosition:1
    //       }
    //       $('.loaderbo').show();       
    //       this.revshare.BuyShare(CustomerPlanModel).subscribe(res =>{                
    //         if(res.Message == "success"){
    //           this.toastr.success("Your purchase was successful");
    //           this.stName.value.NoOfPack = 0;
    //           this.Total = 0;
    //           this.router.navigate(['/dashboard']);
              
    //         }
    //         else{
    //           this.toastr.error(res.Message);
    //         }    
    //         $('.loaderbo').hide();            
    //       },
    //       err => {
    //         if(err.status == 401){
    //           localStorage.clear();
    //           $('.loaderbo').hide();
    //           this.router.navigate(['/login']);
    //         }
    //         else{
    //           this.toastr.error("Something went wrong, contact support","Error")
    //         }                      
    //       })
    //     }
    //   }else{
    //     this.toastr.error("Please select package","Error")
    //   }
        
      
    //  }
}

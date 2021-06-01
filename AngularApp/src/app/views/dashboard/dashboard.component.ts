import { Component, OnInit, ViewChild } from '@angular/core';
import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { CustomerService } from '../../services/customer.service';
import { environment } from '../../../environments/environment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';

import * as $ from 'jquery';
import { AdvertismentService } from '../../services/advertisment.service';
import { MatrixService } from '../../services/matrix.service';
import { ToastrService } from 'ngx-toastr';
import { CommonService } from '../../services/common.service';
import { timer } from 'rxjs';
@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  constructor(
    private matrixservice: MatrixService,
    private toastr: ToastrService,
    private customerservice: CustomerService,
    private advertismenetSerive:AdvertismentService,
    private commonservice:CommonService,
    private router: Router) { }
 
  radioModel: string = 'Month';
  CustomerId :string = localStorage.getItem("CustomerId");
  SiteUrl : string = environment.siteUrl;
  CustomerInfoModel = { Email:'',BitcoinAddress:'',Enable2FA:false,TotalReferral:0,SystemName:'',Status : '', FullName :'',AvailableBalance :0,TradeIncome:0,NetworkIncome:0,RoyaltyIncome:0,TodaysPair:'',AvailableCoin:0,TotalEarning:0,DirectBonus:0,
  AvailableCoins:0,UnilevelEarning : 0,CyclerIncome:0,CustomerId:0,RegistrationDate:'',ServerTime :'',ReferredBy:'',AffilateId:0,
  NoOfSecondsToSurf:0,NoOfAdsToSurf:0,PlacementId:0,Position:'',Username:'',PlacementUserName:'',AccumulatedPairing:'',PackageName:''}
  CustomerBoard = [];
  Managers = [] = environment.Managers;
  Campaigns = [];
  NewsLetter ={ Body:""};
  MerchantAcc:string = "";
  CurrencyCode:string = "USD";
  FinalAmount:number = 10;
  PaymentMemo:string = "Matrix Position Purchase";
  ipn_url:string = '';
  ShowPhaseMessage = true;
  TransactionId = localStorage.getItem("transactionno");
  WalletMessage = "";
  ContractMessage = "";
  TwoFAMessage = "";
  BinaryMessge = "";
 
  treebalance:any = {};
  @ViewChild('infoModal') public infoModal: ModalDirective;
  @ViewChild('congratsModal') public congratsModal: ModalDirective;
  @ViewChild('newsModal') public newsModal: ModalDirective;
   // lineChart2
   public lineChart2Data: Array<any> = [
    {
      data: [1, 18, 9, 17, 34, 22, 11],
      label: 'Series A'
    }
  ];
  
  ngOnInit(): void {
        this.CurrencyCode = (localStorage.getItem("CurrencyCode") == null) ? "USD" : localStorage.getItem("CurrencyCode");
        this.ipn_url = environment.siteUrl + '/IPNHandler';
        this.FinalAmount = 10;
        this.MerchantAcc = environment.coinPaymentMerAcc;
        $('.loaderbo').show();
        
        this.customerservice.GetCustomerInfo(this.CustomerId)
        .subscribe(
          res => {
            this.CustomerInfoModel = res.data;
            if(this.CustomerInfoModel.BitcoinAddress != null){
              this.WalletMessage= "Wallet Address has been configured."
            }else{
              this.WalletMessage= "Wallet Address has not been configured."
            }
            if(this.CustomerInfoModel.Enable2FA == true){
              this.TwoFAMessage= "2FA is enabled."
            }else{
              this.TwoFAMessage= "2FA is not enabled."
            }
            if(this.CustomerInfoModel.Status == "Active"){
              this.ContractMessage= "Your Contract is Active."
            }else{
              this.ContractMessage= "Your Contract is Not Active."
            }
            if(this.CustomerInfoModel.TotalReferral > 2){
              this.BinaryMessge= "You are Qualified on Binary."
            }else{
              this.BinaryMessge= "You are not Qualified on Binary."
            }
            if(this.CustomerInfoModel.FullName == null){
              this.router.navigate(['/base/account']);
            }
            
            if(localStorage.getItem("firstvisit") != "true"){
             // this.congratsModal.show();
              localStorage.setItem("firstvisit","true");
            }

            if(this.CustomerInfoModel.Status != "Active" && environment.AllowPurchase){
             // this.infoModal.show();
            }
            $('.loaderbo').hide();
          },
          err => {
            if(err.status == 401){
              localStorage.clear();
              this.router.navigate(['/login']);
            }
          }
        )
    
        let model = {
          CustomerId : this.CustomerId
        }
        
       
          this.matrixservice.GetTreeBalance(this.CustomerId).subscribe(
            response =>{
                let balance = response.data;
                this.treebalance = balance[0];
            }
          );
        
        
       
        this.commonservice.GetNewsletter().subscribe(
          res => {
            if(res.Message == "success"){
              this.NewsLetter = JSON.parse(res.data)[0];
              //this.newsModal.show();
            }
          }
        )
  }

  copyInputMessage(inputElement){
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
  }

  SetBinarySetting(value){
    $('.loaderbo').show();
    this.customerservice.UpdateBinaryPlacementSetting(this.CustomerId,value).subscribe(
    res => {
      this.CustomerInfoModel.SystemName =value;
      this.toastr.success("Placment Setting Updated");
      $('.loaderbo').hide();
    })
  }
  countshare(){
    alert("shared link");
  }
}

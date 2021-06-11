using SmartStore.Services.Hyip;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Web;
using System.Web.Mvc;
using SmartStore.Core.Domain.Hyip;
using SmartStore.Services;
using SmartStore.Web.Framework.Controllers;
using SmartStore.Core;
using SmartStore.Services.Customers;
using SmartStore.Core.Domain.Customers;
using SmartStore.Services.Localization;
using SmartStore.Core.Domain.Localization;
using SmartStore.Services.Boards;

namespace SmartStore.Web.Controllers
{
	public class IPNHandlerController : PublicControllerBase
	{
		private readonly ICustomerPlanService _customerPlanService;
		private readonly ITransactionService _transactionService;
		private readonly ICommonServices _commonService;
		private readonly IStoreContext _storeContext;
		private readonly IPlanService _planService;
		private readonly ICustomerService _customerService;
		private readonly LocalizationSettings _localizationSettings;
		private readonly IBoardService _boardService;
		public IPNHandlerController(ICustomerPlanService customerPlanService,
			ITransactionService transactionService,
			ICommonServices commonService,
			IStoreContext storeContext,
			IPlanService planService,
			ICustomerService customerService,
			LocalizationSettings localizationSettings,
			IBoardService boardService)
		{
			_customerPlanService = customerPlanService;
			_transactionService = transactionService;
			_commonService = commonService;
			_storeContext = storeContext;
			_planService = planService;
			_customerService = customerService;
			_localizationSettings = localizationSettings;
			_boardService = boardService;
		}
		static string ByteToString(byte[] buff)
		{
			string sbinary = "";
			for (int i = 0; i < buff.Length; i++)
				sbinary += buff[i].ToString("X2"); /* hex format */
			return sbinary;
		}
		// GET: IPNHandler
		public ActionResult CoinpaymentIPN()
		{
			var coinpaymentSettings = _commonService.Settings.LoadSetting<CoinPaymentSettings>(_storeContext.CurrentStore.Id);
			string MerchantId = coinpaymentSettings.CP_MerchantId;
			string Secret = coinpaymentSettings.CP_SecretKey;
			
			if (Request.ServerVariables["HTTP_HMAC"] == null)
			{
				return Content("HTTP_HMAC not found");
			}
			if (Request.ServerVariables["HTTP_HMAC"].ToString() == "")
			{
				return Content("HTTP_HMAC not found");
			}
			var transaction = _transactionService.GetTransactionById(int.Parse(Request["custom"].ToString()));
			string serverMerchantId = (Request["merchant"] == null) ? "" : Request["merchant"].ToString();
			if (serverMerchantId == MerchantId)
			{
				if (int.Parse(Request["status"].ToString()) >= 1 && Convert.ToInt64(Request["amount1"].ToSafe()) >= transaction.Amount)
				{
					if (transaction.StatusId != 2)
					{
						transaction.Status = Status.Completed;
						transaction.StatusId = (int)Status.Completed;
						transaction.FinalAmount = transaction.Amount;
						transaction.TranscationNote = transaction.TranscationNote + ":" + Request["txn_id"].ToSafe();
						_transactionService.UpdateTransaction(transaction);
						if (transaction.TranscationTypeId == 2)
						{
							var exisitingPlan = _customerService.GetCurrentPlanList(transaction.CustomerId);
							var plan = _planService.GetPlanById(transaction.RefId);
							var customerplan = new CustomerPlan();
							customerplan.CustomerId = transaction.CustomerId;
							customerplan.PurchaseDate = DateTime.Now;
							customerplan.CreatedOnUtc = DateTime.Now;
							customerplan.UpdatedOnUtc = DateTime.Now;
							customerplan.PlanId = transaction.RefId;
							customerplan.AmountInvested = plan.MaximumInvestment;
							if (exisitingPlan != null)
							{
								customerplan.ROIPaid = exisitingPlan.ROIPaid;
								customerplan.NoOfPayoutPaid = exisitingPlan.NoOfPayoutPaid;
							}
							customerplan.ROIToPay = (plan.MaximumInvestment * 3);
							customerplan.NoOfPayout = plan.NoOfPayouts;
							customerplan.ExpiredDate = DateTime.Today;
							customerplan.IsActive = true;
							if (plan.StartROIAfterHours > 0)
								customerplan.LastPaidDate = DateTime.Today.AddHours(plan.StartROIAfterHours);
							else
								customerplan.LastPaidDate = DateTime.Today;
							_customerPlanService.InsertCustomerPlan(customerplan);
							
							_customerService.SpPayNetworkIncome(customerplan.CustomerId, customerplan.PlanId);
							if (exisitingPlan != null)
							{
								exisitingPlan.IsActive = false;
								exisitingPlan.IsExpired = true;
								exisitingPlan.ROIPaid = 0;
								exisitingPlan.NoOfPayoutPaid = 0;
								_customerPlanService.UpdateCustomerPlan(exisitingPlan);
							}
							Services.MessageFactory.SendDepositNotificationMessageToUser(transaction, "", "", _localizationSettings.DefaultAdminLanguageId);

						}
					}
				}
			}

			return Content("MerchantId not matched");
		}

		public void ApproveTransaction(int transid)
		{
			var transaction = _transactionService.GetTransactionById(transid);
			if (transaction.StatusId != 2)
			{
				transaction.Status = Status.Completed;
				transaction.StatusId = (int)Status.Completed;
				transaction.FinalAmount = transaction.Amount;
				transaction.TranscationNote = transaction.TranscationNote + ":" + Request["txn_id"].ToSafe();
				_transactionService.UpdateTransaction(transaction);
				if (transaction.TranscationTypeId == 2)
				{
					var exisitingPlan = _customerService.GetCurrentPlanList(transaction.CustomerId);
					var plan = _planService.GetPlanById(transaction.RefId);
					var customerplan = new CustomerPlan();
					customerplan.CustomerId = transaction.CustomerId;
					customerplan.PurchaseDate = DateTime.Now;
					customerplan.CreatedOnUtc = DateTime.Now;
					customerplan.UpdatedOnUtc = DateTime.Now;
					customerplan.PlanId = transaction.RefId;
					customerplan.AmountInvested = plan.MaximumInvestment;
					if (exisitingPlan != null)
					{
						customerplan.ROIPaid = exisitingPlan.ROIPaid;
						customerplan.NoOfPayoutPaid = exisitingPlan.NoOfPayoutPaid;
					}
					customerplan.ROIToPay = (plan.MaximumInvestment * 3);
					customerplan.NoOfPayout = plan.NoOfPayouts;
					customerplan.ExpiredDate = DateTime.Today;
					customerplan.IsActive = true;
					if (plan.StartROIAfterHours > 0)
						customerplan.LastPaidDate = DateTime.Today.AddHours(plan.StartROIAfterHours);
					else
						customerplan.LastPaidDate = DateTime.Today;
					_customerPlanService.InsertCustomerPlan(customerplan);
					_customerService.SpPayNetworkIncome(customerplan.CustomerId, customerplan.PlanId);
					if (exisitingPlan != null)
					{
						exisitingPlan.IsActive = false;
						exisitingPlan.IsExpired = true;
						exisitingPlan.ROIPaid = 0;
						exisitingPlan.NoOfPayoutPaid = 0;
						_customerPlanService.UpdateCustomerPlan(exisitingPlan);
					}
					Services.MessageFactory.SendDepositNotificationMessageToUser(transaction, "", "", _localizationSettings.DefaultAdminLanguageId);

				}
			}
		}

		public void WritetoLog(string message)
		{
			System.IO.File.WriteAllText(Server.MapPath("/WriteLines.txt"), message);
		}

		public void ReleaseLevelCommission(int planid, Customer customer)
		{
			//Save board position
			int customerid = customer.Id;
			_customerService.SaveCusomerPosition(customerid, planid);
			//var cycledpositionformail = _boardService.GetAllPositionForEmailNotification();
			Transaction transaction;
			Customer levelcustomer = _customerService.GetCustomerById(customer.AffiliateId);
			var board = _boardService.GetBoardById(planid);
			//Direct Bonus
			if (levelcustomer != null)
			{
				//Send Direct Bonus
				try
				{
					//var directcount = _customerService.GetCustomerPaidDirectReferral(levelcustomer.Id);
					if (levelcustomer.CustomerPosition.Count > 1)
					{
						if (levelcustomer.Transaction.Where(x => x.StatusId == 2).Sum(x => x.Amount) > 0)
						{
							transaction = new Transaction();
							transaction.CustomerId = levelcustomer.Id;
							transaction.Amount = (float)board.DisplayOrder;
							transaction.FinalAmount = (float)board.DisplayOrder;
							transaction.TransactionDate = DateTime.Now;
							transaction.StatusId = (int)Status.Completed;
							transaction.TranscationTypeId = (int)TransactionType.DirectBonus;
							transaction.TranscationNote = board.Name + " Direct Bonus";
							_transactionService.InsertTransaction(transaction);
							Services.MessageFactory.SendDirectBonusNotificationMessageToUser(transaction, "", "", _localizationSettings.DefaultAdminLanguageId);
						}
					}
				}
				catch (Exception ex)
				{
					//WritetoLog("Direct Bonus error :" + ex.ToString());
				}
			}

			//Unilevel Bonus
			//for (int i = 0; i < board.Height; i++)
			//{
			//	if (levelcustomer != null)
			//	{
			//		//Send Direct Bonus
			//		try
			//		{
			//			//var directcount = _customerService.GetCustomerPaidDirectReferral(levelcustomer.Id);
			//			if (levelcustomer.CustomerPosition.Count > 1)
			//			{
			//				if (levelcustomer.Transaction.Where(x => x.StatusId == 2).Sum(x => x.Amount) > 0)
			//				{
			//					transaction = new Transaction();
			//					transaction.CustomerId = levelcustomer.Id;
			//					if (board.Id == 1 && i == 4)
			//					{
			//						transaction.Amount = (float)3;
			//						transaction.FinalAmount = (float)3;
			//					}
			//					else
			//					{
			//						transaction.Amount = (float)board.Payout;
			//						transaction.FinalAmount = (float)board.Payout;
			//					}
			//					transaction.TransactionDate = DateTime.Now;
			//					transaction.StatusId = (int)Status.Completed;
			//					transaction.TranscationTypeId = (int)TransactionType.UnilevelBonus;
			//					transaction.TranscationNote = board.Name + " Earning";
			//					_transactionService.InsertTransaction(transaction);
			//					Services.MessageFactory.SendUnilevelBonusNotificationMessageToUser(transaction, "", "", _localizationSettings.DefaultAdminLanguageId);
			//				}
			//			}
			//		}
			//		catch (Exception ex)
			//		{
			//			//WritetoLog("Direct Bonus error :" + ex.ToString());
			//		}
			//		levelcustomer = _customerService.GetCustomerById(levelcustomer.AffiliateId);
			//	}
			//}

		}
	}
}
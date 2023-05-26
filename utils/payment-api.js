class PaymentApi {
    
    static currentTime = Date.now();
    static BusinessShortCode = 174379;
    Password ="MTc0Mzc5YmZiMjc5ZjlhYTliZGJjZjE1OGU5N2RkNzFhNDY3Y2QyZTBjODkzMDU5YjEwZjc4ZTZiNzJhZGExZWQyYzkxOTIwMjMwNDEwMTQxMTI3";
    Timestamp = "20230410141127";
    static TransactionType = "CustomerPayBillOnline";
    Amount = 1;
    PartyA = "";
    static PartyB = 174379;
    PhoneNumber = "";
    CallBackURL = '';
    AccountReference = "AKJD92F";
    TransactionDesc = "Fuse Ltd";

    constructor(payee, amount) {
        this.PartyA = payee;
        this.PhoneNumber = payee;
        this.Amount = amount;
    }

    static accessToken = (timestamp) => {

    //calculate current timestamp
    //check if current timestamp and supplied 
}

}



module.exports = { PaymentApi, accessToken };
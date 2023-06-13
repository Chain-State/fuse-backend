//root path
const API_V1 = '/api/v1';

//Cardano-wallet constants
const SEED_SIZE = 24;
const WALLET_NAME_PREFIX = 'FP_';


//app routes 
const REGISTER = '/register';
const TRANSACT = '/transact';
const PURCHASE = `${TRANSACT}/buy`;
const TRANSFER = '/transfer';

//http headers 
const CONTENT_TYPE = 'Content-Type';
const AUTHORIZATION = 'Authorization';

//response codes
const RESPONSE_OK = 200;
const RESPONSE_CREATED = 201;
const SERVER_ERROR = 500; 
const CLIENT_ERROR = 400;

//errors
const REQUIRED_INPUT = 'Required data missing';
const ERR_WALLET_NOT_FOUND = 'Could not find wallet for this transaction';
const ERR_TX_DATA_MISSING = 'Data required for transaction is missing';
const ERR_ACCESS_TOKEN_FETCH = 'Could not get access token for this transaction';

const ERR_SAVE_FAIL = 'Could not save data';

//security strings
const CIPHER_ALGORITHM = 'aes-256-cbc';
const STR_BASE64 = 'base64';
const STR_UTF8 = 'utf8';

//transactions
const ACCESS_TOKEN_URL = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
const BUSINESS_SHORT_CODE = 174379;
const API_KEYPASS = 'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
const TRANSACTION_TYPE = 'CustomerPayBillOnline';
const KIBANDA_APP_USERNAME = 'AvAx6uMiOmHQywy9DreAotlCLFQwzlZS';
const KIBANDA_APP_PASSWORD = 'To1WS9gbEc4JhOeV';
const TRANSACTION_DESCRIPTION = 'Fuse Ltd';
//B2C
const INITIATOR_NAME = 'Fuse App';
const B2C_COMMAND_ID = 'BusinessPayment';
const B2C_PAYMENT_REMARKS = 'Fuse Payment';
const B2C_PAYMENT_OCCASION = 'Payment of something'
const B2C_SANDBOX_APP_PASSWORD = 'WDCks&c3B-?3_hB'
const B2C_TimeOutURl_SANDBOX = "https://mydomain.com/b2c/queue"
const B2C_ResultURl_SANDBOX = "https://mydomain.com/b2c/queue"


module.exports = {
    API_V1,
    WALLET_NAME_PREFIX,
    SEED_SIZE,
    REGISTER,
    CONTENT_TYPE,
    AUTHORIZATION,
    RESPONSE_CREATED,
    RESPONSE_OK,
    SERVER_ERROR,
    CLIENT_ERROR,
    REQUIRED_INPUT,
    ERR_SAVE_FAIL,
    ERR_WALLET_NOT_FOUND,
    ERR_TX_DATA_MISSING,
    ERR_ACCESS_TOKEN_FETCH,
    CIPHER_ALGORITHM,
    STR_BASE64,
    STR_UTF8,
    PURCHASE,
    TRANSFER,
    ACCESS_TOKEN_URL,
    BUSINESS_SHORT_CODE,
    API_KEYPASS,
    TRANSACTION_TYPE,
    KIBANDA_APP_USERNAME,
    KIBANDA_APP_PASSWORD,
    TRANSACTION_DESCRIPTION,
    B2C_COMMAND_ID,
    INITIATOR_NAME,
    B2C_PAYMENT_REMARKS,
    B2C_PAYMENT_OCCASION,
    B2C_SANDBOX_APP_PASSWORD,
    B2C_TimeOutURl_SANDBOX,
    B2C_ResultURl_SANDBOX

};

//root path
const API_V1 = '/api/v1';

//Cardano-wallet constants
const WALLET_SERVER = 'http://127.0.0.1:8090/v2';
const SEED_SIZE = 24;
const WALLET_NAME_PREFIX = 'FP_';


//app routes 
const REGISTER = '/register';
const TRANSACT = '/transact';
const PURCHASE = `${TRANSACT}/buy`;
const TRANSFER = '/transfer';

//response codes
const RESPONSE_OK = 200;
const RESPONSE_CREATED = 201;
const SERVER_ERROR = 500; 
const CLIENT_ERROR = 400;

//errors
const REQUIRED_INPUT = 'Required data missing';
const ERR_WALLET_NOT_FOUND = 'Could not find wallet for this transaction';
const ERR_TX_DATA_MISSING = 'Data required for transaction is missing';

const ERR_SAVE_FAIL = 'Could not save data';

//security strings
const CIPHER_ALGORITHM = 'aes-256-cbc';
const STR_BASE64 = 'base64';
const STR_UTF8 = 'utf8';

module.exports = {
    API_V1,
    WALLET_SERVER,
    WALLET_NAME_PREFIX,
    SEED_SIZE,
    REGISTER,
    RESPONSE_CREATED,
    RESPONSE_OK,
    SERVER_ERROR,
    CLIENT_ERROR,
    REQUIRED_INPUT,
    ERR_SAVE_FAIL,
    ERR_WALLET_NOT_FOUND,
    ERR_TX_DATA_MISSING,
    CIPHER_ALGORITHM,
    STR_BASE64,
    STR_UTF8,
    PURCHASE,
    TRANSFER,
};

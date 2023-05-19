//root path
const API_V1 = '/api/v1';

//app routes 
const REGISTER = '/register'


//response codes
const RESPONSE_OK = 200;
const RESPONSE_CREATED = 201;
const SERVER_ERROR = 500; 
const CLIENT_ERROR = 400;

//errors
const REQUIRED_INPUT = 'Required data missing';

const SAVE_FAIL = 'Could not save data';

module.exports = {
    API_V1,
    REGISTER,
    RESPONSE_CREATED,
    RESPONSE_OK,
    SERVER_ERROR,
    CLIENT_ERROR,
    REQUIRED_INPUT,
    SAVE_FAIL,
};

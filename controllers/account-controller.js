const {save} = require('../services/account-service');
const {CLIENT_ERROR, REQUIRED_INPUT, RESPONSE_CREATED, SERVER_ERROR} = require('../constants/api-strings');
const register = async (request, response) => {

   const { emailAddress, phoneNumber, password, firstName, lastName, dateOfBirth, idNumber } = request.body;
   if (!emailAddress || !phoneNumber || !password || !firstName || !lastName || !dateOfBirth || !idNumber){
    return response.status(CLIENT_ERROR).json({
            data: {
                error: REQUIRED_INPUT,
            }
        });
   }
   try {
    const saved = await save(request.body);
    if(saved){
        response.status(RESPONSE_CREATED).json(saved);
    }
   } catch (error){
        console.log(error);
        response.status(SERVER_ERROR).json({
            'error': error, 
        });
   }
}

module.exports = {register};
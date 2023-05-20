const { SAVE_FAIL } = require('../constants/api-strings');
const account = require('../database/account');

const save = async (userDetails) => {
    let added = null;
   const { emailAddress, phoneNumber, password, firstName, lastName, dateOfBirth, idNumber } = userDetails;
 
    try{
        added = await account.create({
            emailAddress: emailAddress,
            phoneNumber: phoneNumber,
            password: password,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            idNumber: idNumber

        });
        const {uuid} = added;
        //get the uuid for this record and use for wallet name
        return added;
    } catch (error) {
        throw new Error(`User registration: ${SAVE_FAIL}`)
    }
    return added;

}

module.exports = {save};
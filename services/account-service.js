const { SAVE_FAIL } = require('../constants/api-strings');
const account = require('../database/account');

const save = (userDetails) => {
    let added = false;
   const { emailAddress, phoneNumber, password, firstName, lastName, dateOfBirth, idNumber } = userDetails;
 
    try{
        added = account.create({
            emailAddress: emailAddress,
            phoneNumber: phoneNumber,
            password: password,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            idNumber: idNumber

        });
    } catch (error) {
        throw new Error(`User registration: ${SAVE_FAIL}`)
    }
    return added;

}

module.exports = {save};
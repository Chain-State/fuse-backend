const account = require('../database/account');
const { WalletServer, Seed } = require('cardano-wallet-js');
const {
    ERR_SAVE_FAIL,
    WALLET_SERVER,
    SEED_SIZE,
    ERR_WALLET_NOT_FOUND,
    WALLET_NAME_PREFIX
} = require('../constants/api-strings');

const walletServer = WalletServer.init(WALLET_SERVER);

const createWallet = (userAccountUuid, password) => {
    const mnemonicPhrase = Seed.generateRecoveryPhrase(SEED_SIZE);
    console.log(`seed: ${mnemonicPhrase}`);
    const passPhrase = password;
    const wallet = walletServer.createOrRestoreShelleyWallet(
        WALLET_NAME_PREFIX + userAccountUuid,
        Seed.toMnemonicList(mnemonicPhrase),
        passPhrase,
    );
    return wallet;
};

const save = async (userDetails) => {
    let added = null;
    const { emailAddress, phoneNumber, accountPassword, firstName, lastName, dateOfBirth, idNumber } = userDetails;
    try {
        added = await account.create({
            emailAddress: emailAddress,
            phoneNumber: phoneNumber,
            password: accountPassword,
            firstName: firstName,
            lastName: lastName,
            dateOfBirth: dateOfBirth,
            idNumber: idNumber
        });
        const { uuid, password } = added;
        const { id, name, assets, balance } = await createWallet(uuid, password);
        if (id && name && assets && balance) {
            added = await account.findOneAndUpdate({ _id: added._id }, { $set: { wallet: { id: id, name: name, assets: assets, balance: balance } } }, {new: true});
        }
    } catch (error) {
        throw new Error(`User registration: ${ERR_SAVE_FAIL} because ${error}`)
    }
    return added;

}

module.exports = { save };
const account = require('../database/account');
const keyManage = require('../database/key-manage');
const {cipher} = require('../utils/secure-storage');
const { WalletServer, Seed } = require('cardano-wallet-js');
const {
    ERR_SAVE_FAIL,
    SEED_SIZE,
    WALLET_NAME_PREFIX,
    STR_UTF8,
} = require('../constants/api-strings');

const walletServer = WalletServer.init(process.env.WALLET_SERVER);

const createWallet = (userAccountUuid, password) => {
    const mnemonicPhrase = Seed.generateRecoveryPhrase(SEED_SIZE);
    const { key, encrypted } = cipher(mnemonicPhrase);
    try {
        keyManage.create({
            owner: userAccountUuid,
            seed: encrypted,
            salt: key.toString(STR_UTF8)
        });
    } catch (error) {
        console.log(`Failed key save: ${error}`);
    }
    const wallet = walletServer.createOrRestoreShelleyWallet(
        WALLET_NAME_PREFIX + userAccountUuid,
        Seed.toMnemonicList(mnemonicPhrase),
        password,
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
            added = await account.findOneAndUpdate({ _id: added._id }, { $set: { wallet: { id: id, name: name, assets: assets, balance: balance } } }, { new: true });
        }
    } catch (error) {
        throw new Error(`User registration: ${ERR_SAVE_FAIL} because ${error}`)
    }
    return added;

}

module.exports = { save };
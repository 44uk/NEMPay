import {Injectable} from '@angular/core';
import {Storage} from '@ionic/storage';

// import { Http } from '@angular/http';
// import 'rxjs/add/operator/map';
import * as nemSdk from "nem-sdk";

/*
 Generated class for the NemSdkProvider provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular DI.
 */
@Injectable()
export class NemProvider {
    nem: any;
    wallets: any;

    constructor(private storage: Storage) {
        this.nem = nemSdk;
    }

    /* Filters */

    public hexMessage(msg) {
        return this.nem.default.utils.format.hexMessage(msg);
    }

    public pubToAddress(pub) {
        return this.nem.default.utils.format.pubToAddress(pub, this.nem.default.model.network.data.testnet.id);
    }

    public nemDate(nemDate) {
        return this.nem.default.utils.format.nemDate(nemDate);
    }

    public formatAddress(address) {
        return this.nem.default.utils.format.address(address);
    }

    /* Wallet */
    private _storeWallet(wallet): any {
        var result = [];
        return this.getWallets().then(
            value => {
                result = value;
                result.push(wallet);
                this.storage.set('wallets', JSON.stringify(result));
                return wallet;
            }
        )
    }

    private _checkIfWalletNameExists(walletName): any {
        var exists = false;

        return this.getWallets().then(
            value => {
                var result = value || [];

                for (var i = 0; i < result.length; i++) {
                    if (result[i].name == walletName) {
                        exists = true;
                        break;
                    }
                }
                return exists;
            }
        )
    }

    public checkAddress(privateKey, network, address) {
        return this.nem.default.crypto.helpers.checkAddress(privateKey, network, address);
    }

    public passwordToPrivateKey(common, walletAccount, algo) {
        return this.nem.default.crypto.helpers.passwordToPrivatekey(common, walletAccount, algo);
    }

    public getSelectedWallet(): any {
        return this.storage.get('selectedWallet').then(data => {
            var result = null;
            if (data) {
                result = JSON.parse(data);
            }
            return result;
        });
    }

    public getWallets(): any {
        return this.storage.get('wallets').then(data => {
            var result = [];
            if (data) {
                result = JSON.parse(data);
            }
            return result;
        });
    }

    public setSelectedWallet(wallet) {
        this.storage.set('selectedWallet', JSON.stringify(wallet));
    }

    public unsetSelectedWallet() {
        this.storage.set('selectedWallet', null);
    }

    public createSimpleWallet(walletName, password, network) {
        let wallet = this.nem.default.model.wallet.createPRNG(walletName, password, this.nem.default.model.network.data.testnet.id);
        return this._checkIfWalletNameExists(walletName).then(
            value => {
                if (value) {
                    return null;
                }
                else {
                    return this._storeWallet(wallet).then(
                        value => {
                            return value;
                        }
                    )
                }
            }
        )
    }

    public createBrainWallet(walletName, password, network) {
        //TODO: make able to choose netwok
        let wallet = this.nem.default.model.wallet.createBrain(walletName, password, this.nem.default.model.network.data.testnet.id);

        return this._checkIfWalletNameExists(walletName).then(
            value => {
                if (value) {
                    return null;
                }
                else {
                    return this._storeWallet(wallet).then(
                        value => {
                            return value;
                        }
                    )
                }
            }
        )
    }

    public createPrivateKeyWallet(walletName, password, privateKey, network) {
        //TODO: make able to choose netwok
        let wallet = this.nem.default.model.wallet.importPrivateKey(walletName, password, privateKey, this.nem.default.model.network.data.testnet.id);
        return this._checkIfWalletNameExists(walletName).then(
            value => {
                if (value) {
                    return null;
                }
                else {
                    return this._storeWallet(wallet).then(
                        value => {
                            return value;
                        }
                    )
                }
            }
        )
    }

    /* Balance */

    public getMosaicsMetaDataPair(mosaicNamespaceId, mosaicId) {

        // init endpoint
        var endpoint = this.nem.default.model.objects.create("endpoint")(this.nem.default.model.nodes.defaultTestnet, this.nem.default.model.nodes.defaultPort);

        var mosaicDefinitionMetaDataPair = this.nem.default.model.objects.get("mosaicDefinitionMetaDataPair");

        return this.nem.default.com.requests.namespace.mosaicDefinitions(endpoint, mosaicNamespaceId).then(
            value => {
                // Look for the mosaic definition(s) we want in the request response (Could use ["eur", "usd"] to return eur and usd mosaicDefinitionMetaDataPairs)
                var neededDefinition = this.nem.default.utils.helpers.searchMosaicDefinitionArray(value, [mosaicId]);

                // Get full name of mosaic to use as object key
                var fullMosaicName = mosaicNamespaceId + ':' + mosaicId;

                // Check if the mosaic was found
                if (undefined === neededDefinition[fullMosaicName]) {
                    console.error("Mosaic not found !");
                    return mosaicDefinitionMetaDataPair;
                }
                // Set mosaic definition into mosaicDefinitionMetaDataPair
                mosaicDefinitionMetaDataPair[fullMosaicName] = {};
                mosaicDefinitionMetaDataPair[fullMosaicName].mosaicDefinition = neededDefinition[fullMosaicName];

                return mosaicDefinitionMetaDataPair;
            }
        );
    }


    private _addDivisibilityToBalance(balance) {
        var promises = [];

        for (let mosaic of balance.data) {
            promises.push(this.getMosaicsMetaDataPair(mosaic.mosaicId.namespaceId, mosaic.mosaicId.name));
        }

        return Promise.all(promises).then(values => {
                var i = 0;
                for (let mosaic of balance.data) {
                    mosaic.definition = values[i][mosaic.mosaicId.namespaceId + ':' + mosaic.mosaicId.name].mosaicDefinition;
                    ++i;
                }
                return balance;
            }
        );
    }

    public getBalance(address) {
        var endpoint = this.nem.default.model.objects.create("endpoint")(this.nem.default.model.nodes.defaultTestnet, this.nem.default.model.nodes.defaultPort);
        // Gets account data
        return this.nem.default.com.requests.account.mosaics(endpoint, address).then(
            value => {
                return this._addDivisibilityToBalance(value);
            }
        ).catch(error => {
            return false;
        })
    }

    /* Transfer */

    public formatLevy(mosaic, multiplier, levy) {

        this.nem.default.model.objects.get("mosaicDefinitionMetaDataPair");
        return Promise.all([this.getMosaicsMetaDataPair(mosaic.mosaicId.namespaceId, mosaic.mosaicId.name), this.getMosaicsMetaDataPair(levy.mosaicId.namespaceId, levy.mosaicId.name)]).then(values => {
            var mosaicDefinitionMetaDataPair = values[0];
            mosaicDefinitionMetaDataPair[levy.mosaicId.namespaceId + ':' + levy.mosaicId.name] = values[1][levy.mosaicId.namespaceId + ':' + levy.mosaicId.name];
            return this.nem.default.utils.format.levyFee(mosaic, multiplier, levy, mosaicDefinitionMetaDataPair);

        });
    }

    public isFromNetwork(address, isFromNetwork) {
        return this.nem.default.model.address.isFromNetwork(address, this.nem.default.model.network.data.testnet.id);
    }


    public prepareTransaction(common, formData) {
        // Create transfer transaction
        var transferTransaction = this.nem.default.model.objects.create("transferTransaction")(formData.recipient, formData.amount, formData.message);


        return this.nem.default.model.transactions.prepare("transferTransaction")(common, transferTransaction, this.nem.default.model.network.data.testnet.id);

    }


    public prepareMosaicTransaction(common, formData) {
        // Create transfer transaction
        var transferTransaction = this.nem.default.model.objects.create("transferTransaction")(formData.recipient, formData.amount, formData.message);

        let mosaicAttachment = this.nem.default.model.objects.create("mosaicAttachment")(formData.mosaics[0].mosaicId.namespaceId, formData.mosaics[0].mosaicId.name, formData.mosaics[0].quantity);
        transferTransaction.mosaics.push(mosaicAttachment);

        return this.getMosaicsMetaDataPair(formData.mosaics[0].mosaicId.namespaceId, formData.mosaics[0].mosaicId.name).then(value => {
            return this.nem.default.model.transactions.prepare("mosaicTransferTransaction")(common, transferTransaction, value, this.nem.default.model.network.data.testnet.id);
        })
    }


    public confirmTransaction(common, transactionEntity) {
        var endpoint = this.nem.default.model.objects.create("endpoint")(this.nem.default.model.nodes.defaultTestnet, this.nem.default.model.nodes.defaultPort);
        return this.nem.default.model.transactions.send(common, transactionEntity, endpoint);
    }

    private _addDivisibilityToTransaction(mosaics) {
        var promises = [];

        for (let mosaic of mosaics) {
            promises.push(this.getMosaicsMetaDataPair(mosaic.mosaicId.namespaceId, mosaic.mosaicId.name));
        }

        return Promise.all(promises).then(values => {
                var i = 0;
                for (let mosaic of mosaics) {
                    mosaic.definition = values[i][mosaic.mosaicId.namespaceId + ':' + mosaic.mosaicId.name].mosaicDefinition;
                    ++i;
                }
                return mosaics;
            }
        );
    }

    private _adaptTransactions(transactions) {
        var promises = [];

        for (let tx of transactions) {
            if (tx.transaction.mosaics) {
                promises.push(this._addDivisibilityToTransaction(tx.transaction.mosaics));
            }
        }

        return Promise.all(promises).then(values => {
            var i = 0;

            for (let tx of transactions) {
                if (tx.transaction.mosaics) {
                    tx.transaction.mosaics = values[i];
                    ++i;
                }
            }
            return transactions;
        });
    }


    public getAllTransactionsFromAnAccount(address) {
        var endpoint = this.nem.default.model.objects.create("endpoint")(this.nem.default.model.nodes.defaultTestnet, this.nem.default.model.nodes.defaultPort);

        return this.nem.default.com.requests.account.allTransactions(endpoint, address).then(value => {
            return this._adaptTransactions(value);
        });
    }

    public getUnconfirmedTransactionsFromAnAccount(address) {
        var endpoint = this.nem.default.model.objects.create("endpoint")(this.nem.default.model.nodes.defaultTestnet, this.nem.default.model.nodes.defaultPort);
        return this.nem.default.com.requests.account.unconfirmedTransactions(endpoint, address).then(value => {
            return this._adaptTransactions(value);
        });
    }


}

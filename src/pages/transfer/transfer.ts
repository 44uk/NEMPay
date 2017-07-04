import {Component} from '@angular/core';
import {NavController, NavParams, AlertController, LoadingController} from 'ionic-angular';
import {Keyboard} from '@ionic-native/keyboard';

import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {NemProvider} from '../../providers/nem/nem.provider';
import {AlertProvider} from '../../providers/alert/alert.provider';
import {ToastProvider} from '../../providers/toast/toast.provider';

import {BalancePage} from '../balance/balance';
import {LoginPage} from '../login/login';

@Component({
    selector: 'page-transfer',
    templateUrl: 'transfer.html'
})
export class TransferPage {
    formData: any;
    selectedMosaic: any;
    divisibility: any;
    levy: any;
    common: any;
    amount: number;
    selectedWallet: any;
    selectedMosaicDefinitionMetaDataPair: any;

    constructor(public navCtrl: NavController, private navParams: NavParams, private nem: NemProvider, private alert: AlertProvider, private toast: ToastProvider, private barcodeScanner: BarcodeScanner, private alertCtrl: AlertController, private loading: LoadingController, private keyboard: Keyboard) {

        this.formData = {};
        this.amount = 0;
        this.formData.recipientPubKey = '';
        this.formData.message = '';
        this.selectedMosaic = navParams.get('selectedMosaic');
        this.formData.fee = 0;
        this.formData.encryptMessage = false;
        this.formData.innerFee = 0;
        this.formData.encryptMessage = false;
        this.formData.isMultisig = false;
        this.formData.isMosaicTransfer = false;
        this.formData.message = '';
        this.selectedMosaicDefinitionMetaDataPair = undefined;
        this.levy = undefined;
        this.divisibility = undefined;

        //Stores sensitive data.
        this.common = {};

        //Initializes sensitive data.
        this.cleanCommon();

        //Gets mosaic to transfer definition
        if (this.selectedMosaic != 'nem:xem') {
            this.nem.getMosaicsMetaDataPair(this.selectedMosaic.split(":")[0], this.selectedMosaic.split(":")[1]).then(
                value => {
                    this.selectedMosaicDefinitionMetaDataPair = value[this.selectedMosaic];
                    this.levy = value[this.selectedMosaic].mosaicDefinition.levy;
                    this.divisibility = value[this.selectedMosaic].mosaicDefinition.properties[0].value;
                    this.formData.isMosaicTransfer = true;
                }
            )
        }
    }

    ionViewWillEnter() {
        this.nem.getSelectedWallet().then(
            value => {
                if (!value) {
                    this.navCtrl.setRoot(LoginPage);
                }
                else {
                    this.selectedWallet = value;
                }
            }
        )
    }

    /**
     * Clears sensitive data
     */
    cleanCommon() {
        this.common = {
            'password': '',
            'privateKey': ''
        };
    }


    /**
     * Resets recipient data
     */
    resetRecipientData() {
        // Reset public key data
        this.formData.recipientPubKey = '';
        // Reset cleaned recipient address
        this.formData.recipient = '';
    }


    /**
     * check if address is from network
     * @param address Adrress to check
     */
    checkAddress(address) {
        var success = true;
        if (this.nem.isFromNetwork(address)) {
            this.formData.recipient = address;
        }
        else {
            this.resetRecipientData();
            success = false;
        }
        return success;
    }

    /**
     * Cleans this.fromData.rawRecipient and check if account belongs to network
     */
    processRecipientInput() {
        // Reset recipient data
        this.resetRecipientData();
        var success = true;
        // return if no value or address length < to min address length
        if (!this.formData.rawRecipient || this.formData.rawRecipient.length < 40) {
            success = false;
        }
        //if raw data, clean address and check if it is from network
        if (success) {
            let recipientAddress = this.formData.rawRecipient.toUpperCase().replace(/-/g, '');
            success = this.checkAddress(recipientAddress);
        }
        return success;
    }

    /**
     * Check if user can send tranaction
     * TODO: encapsulate in a service, implememntation it is duplicatedin other controllers too
     */
    canSendTransaction() {
        var result = this.nem.passwordToPrivateKey(this.common, this.selectedWallet.accounts[0], this.selectedWallet.accounts[0].algo);
        if (!(this.common.privateKey.length === 64 || this.common.privateKey.length === 66)) result = false;
        return result;
    }

    /**
     * Confirms transaction form xem and mosaicsTransactions
     */
    confirmTransaction() {

        if (this.formData.isMosaicTransfer) {
            return this.nem.prepareMosaicTransaction(this.common, this.formData).then(entity => {
                return this.nem.confirmTransaction(this.common, entity);
            });
        }

        else {
            var entity = this.nem.prepareTransaction(this.common, this.formData);
            return this.nem.confirmTransaction(this.common, entity);
        }
    }

    /**
     * alert Confirmation subtitle builder
     */
    private _subtitleBuilder(): Promise<string> {
        var subtitle = 'You are going to send: <br/><br/> ';
        var currency = '';
        if (this.selectedMosaic == 'nem:xem') {
            currency = "<b>Amount:</b> " + this.amount + " xem";
        }
        else {
            currency = "<b>Amount:</b> " + this.amount + " " + this.selectedMosaic;
        }
        subtitle += currency;

        var _fee = this.formData.fee / 1000000;

        subtitle += '<br/><br/>  <b>Fee:</b> ' + _fee + ' xem';

        if (this.levy != undefined && 'mosaicId' in this.levy) {
            var _levy = 0;
            return this.nem.formatLevy(this.formData.mosaics[0], 1, this.levy).then(value => {
                _levy = value
                subtitle += "<br/><br/> <b>Levy:</b> " + _levy + " " + this.levy.mosaicId.name;
                return subtitle;
            });
        }
        else {
            return Promise.resolve(subtitle);
        }
    }

    /**
     * Presents prompt to confirm the transaction, handling confirmation
     */
    presentPrompt() {
        let loader = this.loading.create({
            content: "Please wait..."
        });

        this._subtitleBuilder().then(subitle => {
            let alert = this.alertCtrl.create({
                title: 'Confirm Transaction',
                subTitle: subitle,
                inputs: [
                    {
                        name: 'passphrase',
                        placeholder: 'Passphrase/Password',
                        type: 'password'
                    },
                ],
                buttons: [
                    {
                        text: 'Cancel',
                        role: 'cancel'
                    },
                    {
                        text: 'Confirm Transaction',
                        handler: data => {
                            this.keyboard.close();
                            this.common.password = data.passphrase;
                            loader.present().then(_ => {
                                if (this.canSendTransaction()) {
                                    this.confirmTransaction().then(value => {
                                        if (value.message == 'SUCCESS') {
                                            loader.dismiss();
                                            console.log("Transactions confirmed");
                                            this.toast.showTransactionConfirmed();
                                            this.navCtrl.push(BalancePage, {});
                                            this.cleanCommon();
                                        }
                                        else if (value.message == 'FAILURE_INSUFFICIENT_BALANCE') {
                                            loader.dismiss();
                                            this.alert.showDoesNotHaveEnoughFunds();
                                        }
                                        else if (value.message == 'FAILURE_MESSAGE_TOO_LARGE') {
                                            loader.dismiss();
                                            this.alert.showMessageTooLarge();
                                        }
                                        else {
                                            loader.dismiss();
                                            this.alert.showError(value.message);
                                        }
                                    });
                                }
                                else {
                                    this.common.privateKey = '';
                                    loader.dismiss();
                                    this.alert.showInvalidPasswordAlert();
                                }
                            });

                        }
                    }
                ]
            });
            alert.onDidDismiss(() => {
                this.keyboard.close()
            })
            alert.present();
        });
    }

    /**
     * Calculates fee into this.formData.fee and presents prompt once finished
     * TODO: Resolve both ifs with a promise, and handle presentPrompt in startTransaction
     */
    updateFees() {
        if (this.formData.isMosaicTransfer) {
            this.nem.prepareMosaicTransaction(this.common, this.formData).then(entity => {
                this.formData.innerFee = 0;
                this.formData.fee = entity.fee;
                this.presentPrompt();
            });
        }
        else {
            var entity = this.nem.prepareTransaction(this.common, this.formData);
            this.formData.innerFee = 0;
            this.formData.fee = entity.fee;
            this.presentPrompt();
        }
    }

    /**
     * Sets transaction amount and determine if it is mosaic or xem transaction, updating fees
     */
    startTransaction() {
        //if is nem:xem, set amount
        if (!this.amount) this.amount = 0;

        if (this.selectedMosaic == 'nem:xem') {
            this.formData.mosaics = [];
            this.formData.amount = this.amount;
        }
        else {
            this.formData.amount = 1;
            var namespace_mosaic = this.selectedMosaic.split(":");
            this.formData.mosaics = [{
                'mosaicId': {
                    'namespaceId': namespace_mosaic[0],
                    'name': namespace_mosaic[1]
                },
                'quantity': this.amount * Math.pow(10, this.divisibility)
            }];
        }
        if (!this.processRecipientInput()) {
            this.alert.showAlertDoesNotBelongToNetwork();
        }
        else {
            this.updateFees();
        }
    }

    /**
     * Scans Account QR and sets account into this.formData.rawRecipient
     */
    scanQR() {
        this.barcodeScanner.scan().then((barcodeData) => {
            var addresObject = JSON.parse(barcodeData.text);
            this.formData.rawRecipient = addresObject.data.addr;
        }, (err) => {
            console.log("Error on scan");
        });
    }
}

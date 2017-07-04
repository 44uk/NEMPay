import {Component} from '@angular/core';
import {NavController, LoadingController} from 'ionic-angular';
import {Clipboard} from '@ionic-native/clipboard';
import {ToastProvider} from '../../providers/toast/toast.provider';
import {NemProvider} from '../../providers/nem/nem.provider';

import {LoginPage} from '../login/login';

@Component({
    selector: 'page-transactions',
    templateUrl: 'transactions.html'
})
export class TransactionsUnconfirmedPage {
    transactions: any;
    address: any;

    constructor(public navCtrl: NavController, private nem: NemProvider, private loading: LoadingController, private toast: ToastProvider, private clipboard: Clipboard) {
        this.transactions = [];
        this.address = '';
    }

    ionViewWillEnter() {
        this.getTransactions(false);
    }

    /**
     * Retrieves current account unconfirmed transactions into this.transactions
     * @param refresher  Ionic refresher or false, if called on View Enter
     */
    getTransactions(refresher) {
        let loader = this.loading.create({
            content: "Please wait..."
        });

        this.nem.getSelectedWallet().then(
            value => {
                this.address = value.accounts[0].address;
                if (!value) {
                    if (refresher) refresher.complete();
                    this.navCtrl.push(LoginPage);
                }
                else {
                    if (refresher) refresher.complete();
                    loader.present();
                    this.nem.getUnconfirmedTransactionsFromAnAccount(value.accounts[0].address).then(
                        value => {
                            this.transactions = value;
                            loader.dismiss();
                        })
                }
            }
        )
    }

    /**
     * Copies into clipboard recipient or sender address
     * @param transaction  transaction object
     */
    copyTransactionAddress(transaction) {
        var address;
        if (this.address == transaction.recipient) {
            address = this.nem.pubToAddress(transaction.signer);
        }
        else {
            address = transaction.recipient;
        }

        this.clipboard.copy(address).then(_ => {
            this.toast.showCopyCorrect();
        });
    }

}

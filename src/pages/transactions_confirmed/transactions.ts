import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Clipboard} from '@ionic-native/clipboard';
import {TranslateService} from '@ngx-translate/core';

import {ConfigProvider} from '../../providers/config/config.provider';
import {ToastProvider} from '../../providers/toast/toast.provider';
import {NemProvider} from '../../providers/nem/nem.provider';
import {LoaderProvider} from '../../providers/loader/loader.provider';

import {LoginPage} from '../login/login';

@Component({
    selector: 'page-transactions',
    templateUrl: 'transactions.html'
})
export class TransactionsConfirmedPage {
    transactions: any;
    address: any;

    constructor(public navCtrl: NavController, private nem: NemProvider, private loader: LoaderProvider, private toast: ToastProvider, private clipboard: Clipboard, private config: ConfigProvider, public translate: TranslateService) {
        this.transactions = [];
        this.address = '';
    }

    ionViewWillEnter() {
        this.getTransactions(false);
    }

    /**
     * Retrieves current account confirmed transactions into this.transactions
     * @param refresher  Ionic refresher or false, if called on View Enter
     */
    public getTransactions(refresher) {

        this.nem.getSelectedWallet().then(
            value => {
                this.address = value.accounts[0].address;
                if (!value) {
                    if (refresher) refresher.complete();
                    this.navCtrl.push(LoginPage);
                }
                else {
                    if (!refresher) this.loader.present();
                    this.nem.getAllTransactionsFromAnAccount(this.address, this.config.defaultNetwork()).then(
                        value => {
                            if (refresher) refresher.complete();
                            else this.loader.dismiss();
                            this.transactions = value;
                        })
                }
            }
        )
    }

    /**
     * Copies into clipboard recipient or sender address
     * @param transaction  transaction object
     */
    public copyTransactionAddress(transaction) {
        var copiableAddress = "";
        if (this.address == transaction.recipient) {
            copiableAddress = this.nem.pubToAddress(transaction.signer, this.config.defaultNetwork());
        }
        else {
            copiableAddress = transaction.recipient;
        }
        this.clipboard.copy(copiableAddress).then(_ => {
            this.toast.showCopyCorrect();
        });
    }

}

import {Component, ViewChild} from '@angular/core';
import {Platform, Nav} from 'ionic-angular';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import {ContactProvider} from '../providers/contact/contact.provider';
import {AlertProvider} from '../providers/alert/alert.provider';
import {LanguageProvider} from '../providers/language/language.provider';

import {AccountPage} from '../pages/account/account';
import {TransactionsPage} from '../pages/transactions/transactions';
import {BalancePage} from '../pages/balance/balance';
import {LoginPage} from '../pages/login/login';
import {ContactListPage} from '../pages/contact/list/list';

import {Network} from '@ionic-native/network';


@Component({
    templateUrl: 'app.html'
})
export class MyApp {
    @ViewChild(Nav) navCtrl: Nav;
    rootPage: any = LoginPage;

    constructor(private platform: Platform, private statusBar: StatusBar, private splashScreen: SplashScreen, private network: Network, private alert: AlertProvider,  private contact: ContactProvider, private language: LanguageProvider, private sqlite: SQLite) {
        platform.ready().then(() => {


            network.onDisconnect().subscribe(() => {
                this.alert.showOnPhoneDisconnected();
            });

            this.language.setLanguage();
            this.setDatabase();

            //ionic default
            statusBar.styleDefault();
        });
    }

    goToBalance(params) {
        if (!params) params = {};
        this.navCtrl.setRoot(BalancePage);
    }

    goToAccount(params) {
        if (!params) params = {};
        this.navCtrl.setRoot(AccountPage);
    }

    goToTransactions(params) {
        if (!params) params = {};
        this.navCtrl.setRoot(TransactionsPage);
    }

    goToContactList(params) {
        if (!params) params = {};
        if (this.platform.is('cordova')) this.navCtrl.setRoot(ContactListPage);

        else {
            this.alert.showFunctionallityOnlyAvailableInMobileDevices();
        }
    }

    private setDatabase(){
        if (this. platform.is('cordova')){
            this.sqlite.create({
                name: 'data.db',
                location: 'default'
            }).then((db: SQLiteObject) => {
                this.contact.setDatabase(db);
                this.contact.createTable().then(_=>{
                    splashScreen.hide();
                });

            }).catch(error =>{
                console.error(error);
            });
        }
        else this.splashScreen.hide();

    }

}

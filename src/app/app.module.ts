import {NgModule, ErrorHandler} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {Http, HttpModule} from '@angular/http'
import {IonicApp, IonicModule, IonicErrorHandler} from 'ionic-angular';
import {IonicStorageModule} from '@ionic/storage';

import {StatusBar} from '@ionic-native/status-bar';
import {SplashScreen} from '@ionic-native/splash-screen';
import {Clipboard} from '@ionic-native/clipboard';
import {Keyboard} from '@ionic-native/keyboard';

import {SocialSharing} from '@ionic-native/social-sharing';
import {Network} from '@ionic-native/network';
import {BarcodeScanner} from '@ionic-native/barcode-scanner';
import {TranslateModule, TranslateLoader} from '@ngx-translate/core';
import {TranslateHttpLoader} from '@ngx-translate/http-loader';
import { Globalization } from '@ionic-native/globalization';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';

import {AlertProvider} from '../providers/alert/alert.provider';
import {ConfigProvider} from '../providers/config/config.provider';
import {ToastProvider} from '../providers/toast/toast.provider';
import {NemProvider} from '../providers/nem/nem.provider';
import {AddressBookProvider} from '../providers/address_book/address_book.provider';


import {DivideByExponentialBaseTenPipe} from '../pipes/divide-by-exponential-base-ten.pipe';
import {HexMessageToStringPipe} from '../pipes/hex-message-to-string.pipe';
import {PubToAddressPipe} from '../pipes/pub-to-address.pipe';
import {NemDatePipe} from '../pipes/nem-date.pipe';
import {FormatAddressPipe} from '../pipes/format-address.pipe';
import {FormatLevyPipe} from '../pipes/format-levy.pipe';
import {MyApp} from './app.component';
import {BalancePage} from '../pages/balance/balance';
import {TransactionsPage} from '../pages/transactions/transactions';
import {TransferPage} from '../pages/transfer/transfer';
import {TransactionsConfirmedPage} from '../pages/transactions_confirmed/transactions';
import {TransactionsUnconfirmedPage} from '../pages/transactions_unconfirmed/transactions';
import {AccountPage} from '../pages/account/account';
import {LoginPage} from '../pages/login/login';
import {SignupPage} from '../pages/signup/signup';
import {SignupSimpleWalletPage} from '../pages/signup_simplewallet/signup';
import {SignupPrivateKeyPage} from '../pages/signup_privatekey/signup';
import {AddressBookPage} from '../pages/address_book/address_book';
import {AddNewAddressPage} from '../pages/modals/add_new_address/add_new_address';
import {SelectRecipientFromAddressBookPage} from '../pages/modals/select_recipient_from_address_book/select_recipient_from_address_book';

export function createTranslateLoader(http: Http) {
    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
    declarations: [
        MyApp,
        BalancePage,
        TransactionsPage,
        TransferPage,
        AccountPage,
        LoginPage,
        SignupPage,
        SignupSimpleWalletPage,
        SignupPrivateKeyPage,
        TransactionsConfirmedPage,
        TransactionsUnconfirmedPage,
        AddressBookPage,
        AddNewAddressPage,
        SelectRecipientFromAddressBookPage,

        DivideByExponentialBaseTenPipe,
        HexMessageToStringPipe,
        PubToAddressPipe,
        NemDatePipe,
        FormatAddressPipe,
        FormatLevyPipe,
        FormatLevyPipe,

    ],
    imports: [
        BrowserModule,
        HttpModule,
        IonicModule.forRoot(MyApp),
        IonicStorageModule.forRoot(),
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: (createTranslateLoader),
                deps: [Http]
            }
        })

    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        BalancePage,
        TransactionsPage,
        TransferPage,
        TransactionsConfirmedPage,
        TransactionsUnconfirmedPage,
        AccountPage,
        LoginPage,
        SignupPage,
        SignupSimpleWalletPage,
        SignupPrivateKeyPage,
        AddressBookPage,
        AddNewAddressPage,
        SelectRecipientFromAddressBookPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        SocialSharing,
        Clipboard,
        Keyboard,
        Network,
        BarcodeScanner,
        Globalization,
        SQLite,
        NemProvider,
        ConfigProvider,
        AlertProvider,
        ToastProvider,
        AddressBookProvider
    ]
})
export class AppModule {
}
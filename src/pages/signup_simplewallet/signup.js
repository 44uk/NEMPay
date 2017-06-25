var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Component } from '@angular/core';
import { App, LoadingController } from 'ionic-angular';
import { NemProvider } from '../../providers/nem/nem.provider';
import { AlertProvider } from '../../providers/alert/alert.provider';
import { LoginPage } from '../login/login';
var SignupSimpleWalletPage = (function () {
    function SignupSimpleWalletPage(app, nem, loading, alert) {
        this.app = app;
        this.nem = nem;
        this.loading = loading;
        this.alert = alert;
        this.newAccount = {
            'name': '',
            'passphrase': '',
            'repeat_passphrase': ''
        };
    }
    SignupSimpleWalletPage.prototype.createSimpleWallet = function () {
        var _this = this;
        if (this.newAccount.passphrase != this.newAccount.repeat_passphrase) {
            this.alert.showPasswordDoNotMatch();
        }
        else {
            var loader_1 = this.loading.create({
                content: "Please wait..."
            });
            loader_1.present().then(function (_) {
                _this.nem.createSimpleWallet(_this.newAccount.name, _this.newAccount.passphrase, -104).then(function (value) {
                    if (value) {
                        loader_1.dismiss();
                        _this.app.getRootNav().push(LoginPage);
                    }
                    else {
                        loader_1.dismiss();
                        _this.alert.showWalletNameAlreadyExists();
                    }
                });
            });
        }
    };
    return SignupSimpleWalletPage;
}());
SignupSimpleWalletPage = __decorate([
    Component({
        selector: 'page-signup-simple-wallet',
        templateUrl: 'signup.html'
    }),
    __metadata("design:paramtypes", [App, NemProvider, LoadingController, AlertProvider])
], SignupSimpleWalletPage);
export { SignupSimpleWalletPage };
//# sourceMappingURL=signup.js.map
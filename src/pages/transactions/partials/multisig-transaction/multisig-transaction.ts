//"type": 4100

import { Component, Input } from '@angular/core';

import 'rxjs/add/operator/toPromise';
import {NemProvider} from '../../../../providers/nem/nem.provider';
import {WalletProvider} from '../../../../providers/wallet/wallet.provider'

import {Address, TransferTransaction, Wallet} from "nem-library";
@Component({
    selector: 'multisig-transaction',
    templateUrl: 'multisig-transaction.html'
})

export class MultisigTransactionComponent {
    @Input() tx: any;
    @Input() address: Address;

    hasLevy:boolean;
    owner: string;

    constructor(private nem: NemProvider, private wallet: WalletProvider) {
        this.hasLevy = false;
    }

    private _populateMosaicsWithDefinitionData(){
        if ((<TransferTransaction>this.tx.otherTransaction).mosaics) {
            this.nem.addDefinitionToMosaics(this.tx.otherTransaction.mosaics).subscribe(mosaics => {
                this.tx.otherTransaction.mosaics = mosaics;
                this.hasLevy = this.nem.transactionHasAtLeastOneMosaicWithLevy(mosaics);
            });
        }
    }

    private _setOwner(){
        this.wallet.getSelectedWallet().then(wallet =>{
            this.owner = wallet.address.plain();
        })
    }

    ngOnInit() {
        this._populateMosaicsWithDefinitionData();
        this._setOwner();
    }


}

import React from 'react';
import {formatCurrency} from "../../utils/helpers";
import {EditIcon, WalletIcon} from "../../utils/icons";

export function WalletsView({wallets, walletBalances, onSelectWallet, onOpenWalletSettings}) {
    return (
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex justify-between items-center my-6">
                <h1 className="text-3xl font-bold">Daftar Dompet</h1>
                <button onClick={onOpenWalletSettings} className="text-blue-600 p-2">
                    <EditIcon/>
                </button>
            </header>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {wallets.map(wallet => (
                    <div key={wallet.id} onClick={() => onSelectWallet(wallet.id)}
                         className="bg-white rounded-lg shadow-sm p-4 flex items-center space-x-3 cursor-pointer">
                        <div className="p-2 bg-blue-100 rounded-full">
                            <WalletIcon/>
                        </div>
                        <div>
                            <p className="font-semibold">{wallet.name}</p>
                            <p className="font-bold text-blue-600">{formatCurrency(walletBalances[wallet.id] || 0)}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

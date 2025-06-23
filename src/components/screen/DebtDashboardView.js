import {useMemo} from "react";
import {ArrowLeftIcon} from "../../utils/icons";
import {formatCurrency} from "../../utils/helpers";

export function DebtDashboardView({contactBalances, onSelectContact, onBack}) {
    const sortedContacts = useMemo(() => Object.entries(contactBalances).sort(([, a], [, b]) => a - b), [contactBalances]);
    return (<div className="bg-gray-100 min-h-screen">
        <div className="container mx-auto max-w-lg p-4 pb-24">
            <header className="flex items-center my-6">
                <button onClick={onBack} className="p-2 mr-2"><ArrowLeftIcon/></button>
                <h1 className="text-2xl font-bold">Utang Piutang</h1></header>
            <div className="space-y-3">{sortedContacts.map(([name, balance]) => (balance !== 0 &&
                <div key={name} onClick={() => onSelectContact(name)}
                     className="bg-white rounded-lg p-4 flex justify-between items-center cursor-pointer"><p
                    className="font-bold">{name}</p>
                    <div className="text-right"><p
                        className={`font-bold ${balance > 0 ? 'text-green-600' : 'text-red-600'}`}>{formatCurrency(balance)}</p>
                        <p className="text-xs text-gray-500">{balance > 0 ? 'Dia berhutang' : 'Saya berhutang'}</p>
                    </div>
                </div>))}
                <div
                    className="text-center text-gray-500 pt-10">{sortedContacts.every(([, b]) => b === 0) && 'Tidak ada utang piutang yang aktif.'}</div>
            </div>
        </div>
    </div>)
}
import React from "react";
import {SearchableDropdown} from "./SearchableDropdown";

export const SearchableWalletSelector = (props) => <SearchableDropdown {...props} items={props.wallets}
                                                                placeholder="Pilih dompet"/>
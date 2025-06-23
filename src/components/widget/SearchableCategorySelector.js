import React, {useMemo} from "react";
import {SearchableDropdown} from "./SearchableDropdown";

export const SearchableCategorySelector = ({categories, selected, onSelect, onAddCategory, onFocus}) => {
    const items = useMemo(() => categories.map(c => ({id: c, name: c})), [categories]);
    return <SearchableDropdown label="Kategori" items={items} selectedId={selected} onSelect={onSelect}
                               onFocus={onFocus} placeholder="Pilih atau cari kategori" onAddNew={onAddCategory}
                               canAddNew={true}/>;
};

import React, {useMemo} from "react";
import {SearchableDropdown} from "./SearchableDropdown";
import { CategoryIcon } from "./CategoryIcon";

export const SearchableCategorySelector = ({categories, selected, onSelect, onAddCategory, onFocus}) => {
    // Ubah items menjadi format yang diharapkan SearchableDropdown
    const items = useMemo(() => categories.map(c => ({
        id: c.id,
        name: c.name,
        // Tambahkan elemen ikon untuk ditampilkan di dropdown
        display: (
            <div className="flex items-center space-x-2">
                <CategoryIcon icon={c.icon} name={c.name} size="w-6 h-6" />
                <span>{c.name}</span>
            </div>
        )
    })), [categories]);

    // Handle penambahan kategori baru
    const handleAddNew = (newCategoryName) => {
        const newCategory = onAddCategory(newCategoryName);
        if (newCategory) {
            onSelect(newCategory.id);
        }
    };

    return <SearchableDropdown
        label="Kategori"
        items={items}
        selectedId={selected}
        onSelect={onSelect}
        onFocus={onFocus}
        placeholder="Pilih atau cari kategori"
        onAddNew={handleAddNew}
        canAddNew={true}
    />;
};
import { chemicalProducts, applyPriceList, extractInventoryConfig } from './products-data.js';

const STORAGE_KEY = 'chyke-don_price_config';

function renderList() {
    const container = document.getElementById('admin-list');

    // Apply existing overrides so the current saved prices show up in the fields
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    applyPriceList(saved);

    container.innerHTML = chemicalProducts.map((p, index) => `
        <tr data-product="${p.name}">
            <td data-label="S/N" style="color: #64748b; font-family: monospace; font-weight: bold; width: 45px; text-align: center; border-bottom: 1px solid #edf2f7; background: #fcfcfc;">${index + 1}</td>
            <td data-label="Product" style="font-weight: 600; color: #1e293b; text-align: left; padding: 12px 15px; border-bottom: 1px solid #edf2f7; border-left: 1px solid #edf2f7;">${p.name}</td>
            <td data-label="Packaging" style="padding: 8px; border-bottom: 1px solid #edf2f7; border-left: 1px solid #edf2f7;">
                <input type="text" class="input-edit pkg-field" value="${p.packaging}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 0.9rem;">
            </td>
            <td data-label="Price" style="padding: 8px; border-bottom: 1px solid #edf2f7; border-left: 1px solid #edf2f7;">
                <input type="text" class="input-edit price-field" value="${p.pricePerKg}" style="width: 100%; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; font-weight: bold; color: #0f172a; font-size: 0.9rem;">
            </td>
        </tr>
    `).join('');
}

function saveToStorage() {
    const config = {};
    document.querySelectorAll('#admin-list tr').forEach(row => {
        const name = row.dataset.product;
        const pkg = row.querySelector('.pkg-field').value;
        const price = row.querySelector('.price-field').value;
        config[name] = { price, package: pkg };
    });
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    alert('Changes applied! Refresh your main website tab to see the updates.');
}

function copyToClipboard() {
    const config = extractInventoryConfig();
    const formatted = JSON.stringify(config, null, 4);
    navigator.clipboard.writeText(formatted).then(() => {
        alert('Configuration copied! You can now paste this into your production environment.');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    renderList();
    document.getElementById('save-btn').addEventListener('click', saveToStorage);
    document.getElementById('export-btn').addEventListener('click', copyToClipboard);
});
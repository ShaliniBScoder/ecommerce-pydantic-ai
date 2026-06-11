import { state, resetAdminForm } from '../services/state.js';
import { fetchProducts, addProduct, updateProduct, deleteProduct, deleteAllProducts, bulkGenerateProducts } from '../services/api_v2.js';
import { renderHeader } from '../components/Header.js';

/**
 * Render the Admin dashboard page to manage products.
 */
export async function renderAdmin() {
  const data = await fetchProducts();
  state.productList = data;

  document.getElementById('app').innerHTML = `
    ${renderHeader()}
    <div class="admin-page">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <h1 class="admin-title">Add / Manage Products</h1>
          <div style="display: flex; gap: 0.5rem; align-items: flex-start; flex-wrap: wrap;">
            <button id="deleteAllBtn" class="btn btn-danger" style="background: #ef4444; color: white; font-weight: bold;">🧨 Delete All Products</button>
            <div style="position: relative;">
              <button id="bulkGenToggle" class="btn btn-warning" style="background: #eab308; color: black; font-weight: bold;">⚡ Generate Products ▾</button>
              <div id="bulkGenPanel" style="display: none; position: absolute; right: 0; top: calc(100% + 6px); background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 1rem; min-width: 220px; z-index: 50; box-shadow: 0 8px 24px rgba(0,0,0,0.4);">
                <p style="color: #94a3b8; font-size: 0.78rem; margin: 0 0 0.6rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Select Categories</p>
                ${['men','women','kids','footwear','accessories'].map(c => `
                  <label style="display: flex; align-items: center; gap: 0.5rem; color: #e2e8f0; font-size: 0.9rem; margin-bottom: 0.4rem; cursor: pointer;">
                    <input type="checkbox" class="bulk-cat-cb" value="${c}" checked style="accent-color: #eab308; width: 15px; height: 15px;" />
                    ${c.charAt(0).toUpperCase() + c.slice(1)}
                  </label>
                `).join('')}
                <button id="bulkGenBtn" class="btn btn-warning" style="margin-top: 0.75rem; width: 100%; background: #eab308; color: black; font-weight: bold; border-radius: 6px;">⚡ Generate</button>
                <p style="color: #64748b; font-size: 0.72rem; margin: 0.4rem 0 0; text-align: center;">100 products per category</p>
              </div>
            </div>
          </div>
      </div>
      <div class="admin-form">
        <h2 class="admin-form-title">${state.isEditing ? 'Edit Product' : 'Add New Product'}</h2>
        <div class="form-grid">
          <input placeholder="Name" class="form-input" id="adminName" value="${state.adminForm.name}" />
          <input placeholder="Description" class="form-input" id="adminDesc" value="${state.adminForm.description}" />
          <input placeholder="Price" type="number" class="form-input" id="adminPrice" value="${state.adminForm.price || ''}" />
          
          <div class="form-col-span">
            <label class="form-label">Category:</label>
            <div class="category-buttons" id="adminCategoryButtons">
              ${['men', 'women', 'kids', 'footwear', 'accessories'].map(cat => `
                <button class="category-btn ${state.adminForm.category === cat ? 'active' : ''}" data-cat="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
              `).join('')}
            </div>
          </div>
          
          <div class="form-col-span">
            <label class="form-label">${state.isEditing ? 'Change Image (optional):' : 'Product Image:'}</label>
            <input type="file" accept="image/png, image/jpeg, image/jpg" id="adminImage" class="form-input" style="width: 100%;" />
            ${state.adminForm.image && !state.imageFile ? `<p style="font-size: 0.875rem; color: #6b7280; margin-top: 0.5rem;">Current image: ${state.adminForm.image}</p>` : ''}
          </div>
          
          <div class="form-col-span">
            <label class="form-label">Select Sizes:</label>
            <div class="checkbox-group">
              ${['S', 'M', 'L', 'XL', 'XXL'].map(size => `
                <label class="checkbox-label">
                  <input type="checkbox" ${state.adminForm.size?.includes(size) ? 'checked' : ''} data-size="${size}" />
                  <span>${size}</span>
                </label>
              `).join('')}
            </div>
          </div>
          
          <div class="form-col-span">
            <label class="form-label">Color:</label>
            <input placeholder="Enter color (e.g., Black, Blue, Red)" class="form-input" style="width: 100%;" id="adminColor" value="${Array.isArray(state.adminForm.color) ? state.adminForm.color.join(', ') : state.adminForm.color || ''}" />
          </div>
        </div>
        
        <div class="form-actions">
          ${state.isEditing ? `
            <button id="updateProductBtn" class="btn btn-blue">Update Product</button>
            <button id="cancelEditBtn" class="btn btn-outline">Cancel</button>
          ` : `
            <button id="addProductBtn" class="btn btn-success">Add Product</button>
          `}
        </div>
      </div>
      
      <h2 class="product-list-title">Product List</h2>
      <div class="product-list-grid">
        ${state.productList.map(p => `
          <div class="product-list-item">
            <img src="${p.image}" alt="${p.name}" />
            <h3>${p.name}</h3>
            <p>${p.description}</p>
            <p class="price">₹${p.price}</p>
            <p class="meta">Category: ${p.category}</p>
            <p class="meta">Sizes: ${p.size?.join(', ') || 'N/A'}</p>
            <div class="product-actions">
              <button class="edit-btn" data-id="${p.id}">Edit</button>
              <button class="delete-btn" data-id="${p.id}">Delete</button>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  setupAdminEvents();
}

function setupAdminEvents() {
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.adminForm.category = btn.dataset.cat;
      renderAdmin();
    });
  });

  document.querySelectorAll('[data-size]').forEach(cb => {
    cb.addEventListener('change', () => {
      const size = cb.dataset.size;
      const currentSizes = state.adminForm.size || [];
      if (cb.checked) {
        state.adminForm.size = [...currentSizes, size];
      } else {
        state.adminForm.size = currentSizes.filter(s => s !== size);
      }
    });
  });

  document.getElementById('addProductBtn')?.addEventListener('click', handleAddProduct);
  document.getElementById('updateProductBtn')?.addEventListener('click', handleUpdateProduct);
  document.getElementById('cancelEditBtn')?.addEventListener('click', () => {
    resetAdminForm();
    renderAdmin();
  });

  // Toggle the bulk-generate panel
  document.getElementById('bulkGenToggle')?.addEventListener('click', (e) => {
    e.stopPropagation();
    const panel = document.getElementById('bulkGenPanel');
    if (panel) panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  });

  // Close panel on outside click
  document.addEventListener('click', (e) => {
    const panel = document.getElementById('bulkGenPanel');
    const toggle = document.getElementById('bulkGenToggle');
    if (panel && !panel.contains(e.target) && e.target !== toggle) {
      panel.style.display = 'none';
    }
  }, { once: true });

  document.getElementById('bulkGenBtn')?.addEventListener('click', async () => {
    const btn = document.getElementById('bulkGenBtn');
    const checkboxes = document.querySelectorAll('.bulk-cat-cb:checked');
    const selectedCats = Array.from(checkboxes).map(cb => cb.value);
    btn.textContent = "⏳ Generating...";
    btn.disabled = true;
    try {
      const result = await bulkGenerateProducts(selectedCats);
      const msg = result.message || 'Products generated successfully!';
      alert(`✅ ${msg} Images may take a moment to load.`);
      document.getElementById('bulkGenPanel').style.display = 'none';
      renderAdmin();
    } catch (e) {
      alert('Failed to generate products.');
      btn.textContent = "⚡ Generate";
      btn.disabled = false;
    }
  });

  document.getElementById('deleteAllBtn')?.addEventListener('click', async () => {
    if (confirm("Are you ABSOLUTELY sure you want to delete EVERY product in the store? This cannot be undone!")) {
      const btn = document.getElementById('deleteAllBtn');
      btn.textContent = "⏳ Deleting...";
      btn.disabled = true;
      try {
        await deleteAllProducts();
        alert('All products have been wiped from the database.');
        renderAdmin();
      } catch (e) {
        alert('Failed to delete products.');
        btn.textContent = "🧨 Delete All Products";
        btn.disabled = false;
      }
    }
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const product = state.productList.find(p => String(p.id) === String(btn.dataset.id));
      if (product) editProduct(product);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => handleDeleteProduct(btn.dataset.id));
  });

  document.getElementById('adminImage')?.addEventListener('change', (e) => {
    state.imageFile = e.target.files?.[0] || null;
  });
}

/**
 * Handle form prepopulation for editing a product.
 */
function editProduct(product) {
  state.isEditing = true;
  state.editId = product.id;
  state.imageFile = null;
  const colorValue = product.color ? (typeof product.color === 'string' ? product.color.split(',').map(c => c.trim()) : product.color) : [];
  state.adminForm = {
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    image: product.image,
    size: product.size || [],
    color: colorValue
  };
  renderAdmin();
}

async function handleAddProduct() {
  const adminForm = state.adminForm;
  adminForm.name = document.getElementById('adminName').value;
  adminForm.description = document.getElementById('adminDesc').value;
  adminForm.price = Number(document.getElementById('adminPrice').value);
  adminForm.color = document.getElementById('adminColor').value.split(',').map(c => c.trim()).filter(c => c);

  if (!adminForm.name || !adminForm.description || !adminForm.price || !adminForm.category) {
    alert('Please fill in all fields');
    return;
  }

  if (!state.imageFile) {
    alert('Please select a product image');
    return;
  }

  const formData = new FormData();
  formData.append('name', adminForm.name);
  formData.append('description', adminForm.description);
  formData.append('price', String(adminForm.price));
  formData.append('category', adminForm.category);
  formData.append('size', adminForm.size?.join(',') || 'M,L');
  formData.append('color', adminForm.color?.join(', ') || 'Black');
  formData.append('image', state.imageFile);

  await addProduct(formData);
  alert('Product Added ✅');
  resetAdminForm();
  renderAdmin();
}

async function handleUpdateProduct() {
  const adminForm = state.adminForm;
  adminForm.name = document.getElementById('adminName').value;
  adminForm.description = document.getElementById('adminDesc').value;
  adminForm.price = Number(document.getElementById('adminPrice').value);
  adminForm.color = document.getElementById('adminColor').value.split(',').map(c => c.trim()).filter(c => c);

  if (!adminForm.name || !adminForm.description || !adminForm.price || !adminForm.category) {
    alert('Please fill in all fields');
    return;
  }

  if (state.imageFile) {
    const formData = new FormData();
    formData.append('name', adminForm.name);
    formData.append('description', adminForm.description);
    formData.append('price', String(adminForm.price));
    formData.append('category', adminForm.category);
    formData.append('size', adminForm.size?.join(',') || 'M,L');
    formData.append('color', adminForm.color?.join(', ') || 'Black');
    formData.append('image', state.imageFile);
    await updateProduct(state.editId, formData, true);
  } else {
    await updateProduct(state.editId, { ...adminForm, size: adminForm.size || ['M', 'L'], color: adminForm.color || ['Black'] });
  }

  alert('Product Updated ✅');
  resetAdminForm();
  renderAdmin();
}

/**
 * Handle the deletion of a product.
 */
async function handleDeleteProduct(id) {
  await deleteProduct(id);
  state.productList = state.productList.filter(p => String(p.id) !== String(id));
  renderAdmin();
}

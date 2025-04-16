const apiBase = '/api/configs';
let page = 1, pageSize = 20, total = 0, configs = [];

function fetchConfigs() {
  fetch(apiBase)
    .then(res => res.json())
    .then(data => {
      configs = data;
      total = configs.length;
      renderTable();
      renderPagination();
    });
}

function renderTable() {
  const tbody = document.getElementById('config-tbody');
  tbody.innerHTML = '';
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, configs.length);
  for (let i = start; i < end; i++) {
    const row = configs[i];
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="checkbox" data-id="${row.id}"></td>
      <td>${row.key}</td>
      <td>${row.value}</td>
      <td>${row.comment || ''}</td>
      <td>
        <button onclick="editRow(${row.id})">编辑</button>
        <button onclick="deleteRow(${row.id})">删除</button>
      </td>
    `;
    tbody.appendChild(tr);
  }
}

function renderPagination() {
  const totalPages = Math.ceil(total / pageSize);
  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="${i === page ? 'active' : ''}" onclick="gotoPage(${i})">${i}</button>`;
  }
  document.getElementById('pagination').innerHTML = html;
}

window.gotoPage = function(p) {
  page = p;
  renderTable();
  renderPagination();
};

document.getElementById('page-size').onchange = function() {
  pageSize = parseInt(this.value, 10);
  page = 1;
  renderTable();
  renderPagination();
};

document.getElementById('select-all').onclick = function() {
  document.querySelectorAll('#config-tbody input[type=checkbox]').forEach(cb => cb.checked = this.checked);
};

document.getElementById('batch-del-btn').onclick = function() {
  const ids = Array.from(document.querySelectorAll('#config-tbody input[type=checkbox]:checked')).map(cb => cb.dataset.id);
  if (!ids.length) return alert('请选择要删除的配置');
  if (!confirm('确定批量删除？')) return;
  fetch(apiBase, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ids.map(Number))
  }).then(() => fetchConfigs());
};

document.getElementById('add-config-btn').onclick = function() {
  showEditModal();
};

document.getElementById('cancel-edit-btn').onclick = function() {
  hideEditModal();
};

document.getElementById('save-edit-btn').onclick = function() {
  const id = this.dataset.id;
  const key = document.getElementById('edit-key').value.trim();
  const value = document.getElementById('edit-value').value.trim();
  const comment = document.getElementById('edit-comment').value.trim();
  if (!key || !value) return alert('Key和Value不能为空');
  if (id) {
    // 编辑
    fetch(apiBase, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ id: Number(id), key, value, comment }])
    }).then(() => { hideEditModal(); fetchConfigs(); });
  } else {
    // 新增
    fetch(apiBase, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify([{ key, value, comment }])
    }).then(() => { hideEditModal(); fetchConfigs(); });
  }
};

window.editRow = function(id) {
  const row = configs.find(c => c.id === id);
  showEditModal(row);
};
window.deleteRow = function(id) {
  if (!confirm('确定删除？')) return;
  fetch(apiBase, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify([id])
  }).then(() => fetchConfigs());
};

function showEditModal(row) {
  document.getElementById('edit-key').value = row ? row.key : '';
  document.getElementById('edit-value').value = row ? row.value : '';
  document.getElementById('edit-comment').value = row ? row.comment : '';
  document.getElementById('save-edit-btn').dataset.id = row ? row.id : '';
  document.getElementById('modal-title').textContent = row ? '编辑配置' : '新增配置';
  document.getElementById('edit-modal').classList.remove('hidden');
}
function hideEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

fetchConfigs(); 
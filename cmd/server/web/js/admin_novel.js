let config = {};
fetch('config.json').then(res => res.json()).then(cfg => { config = cfg; fetchNovels(); });

let page = 1, pageSize = 20, total = 0, novels = [];

function fetchNovels() {
    fetch(config.apiBaseUrl + 'novels')
        .then(res => res.json())
        .then(data => {
            novels = data;
            total = novels.length;
            renderTable();
            renderPagination();
        });
}

function renderTable() {
    const tbody = document.getElementById('novel-tbody');
    tbody.innerHTML = '';
    const start = (page - 1) * pageSize;
    const end = Math.min(start + pageSize, novels.length);
    for (let i = start; i < end; i++) {
        const row = novels[i];
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><input type="checkbox" data-id="${row.id}"></td>
      <td>${row.NickName}</td>
      <td>${row.Number}</td>
      <td>${row.NovelTitle}</td>
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

    // 上一页按钮
    html += `<button class='page-btn' onclick='gotoPage(${page - 1})' ${page === 1 ? 'disabled' : ''}>上一页</button>`;

    // 页码按钮
    let pageList = [];
    if (totalPages <= 7) {
        // 如果总页数小于等于7，显示所有页码
        for (let i = 1; i <= totalPages; i++) {
            pageList.push(i);
        }
    } else {
        // 始终显示第一页
        pageList.push(1);

        if (page <= 4) {
            // 当前页靠近开始
            for (let i = 2; i <= 6; i++) {
                pageList.push(i);
            }
            pageList.push('...');
            pageList.push(totalPages);
        } else if (page >= totalPages - 3) {
            // 当前页靠近结束
            pageList.push('...');
            for (let i = totalPages - 5; i <= totalPages; i++) {
                pageList.push(i);
            }
        } else {
            // 当前页在中间
            pageList.push('...');
            for (let i = page - 2; i <= page + 2; i++) {
                pageList.push(i);
            }
            pageList.push('...');
            pageList.push(totalPages);
        }
    }

    // 渲染页码
    for (let p of pageList) {
        if (p === '...') {
            html += `<span class='page-ellipsis'>...</span>`;
        } else {
            html += `<button class='page-btn${p === page ? ' active' : ''}' onclick='gotoPage(${p})'>${p}</button>`;
        }
    }

    // 下一页按钮
    html += `<button class='page-btn' onclick='gotoPage(${page + 1})' ${page === totalPages ? 'disabled' : ''}>下一页</button>`;

    // 每页条数选择器
    html += `<select class='page-size-select' onchange='changePageSize(this.value)'>
        <option value='10' ${pageSize == 10 ? 'selected' : ''}>10条/页</option>
        <option value='20' ${pageSize == 20 ? 'selected' : ''}>20条/页</option>
        <option value='50' ${pageSize == 50 ? 'selected' : ''}>50条/页</option>
        <option value='100' ${pageSize == 100 ? 'selected' : ''}>100条/页</option>
    </select>`;

    document.getElementById('pagination').innerHTML = html;
}

window.gotoPage = function (p) {
    page = p;
    renderTable();
    renderPagination();
};

window.changePageSize = function (size) {
    pageSize = parseInt(size, 10);
    page = 1;
    fetchNovels();
};

document.getElementById('select-all').onclick = function () {
    document.querySelectorAll('#novel-tbody input[type=checkbox]').forEach(cb => cb.checked = this.checked);
};

document.getElementById('batch-del-btn').onclick = function () {
    const ids = Array.from(document.querySelectorAll('#novel-tbody input[type=checkbox]:checked')).map(cb => cb.dataset.id);
    if (!ids.length) return alert('请选择要删除的小说');
    if (!confirm('确定批量删除？')) return;
    fetch(config.apiBaseUrl + 'novels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids.map(Number))
    }).then(() => fetchNovels());
};

document.getElementById('add-novel-btn').onclick = function () {
    showEditModal();
};

document.getElementById('cancel-edit-btn').onclick = function () {
    hideEditModal();
};

document.getElementById('save-edit-btn').onclick = function () {
    const id = this.dataset.id;
    const NickName = document.getElementById('edit-nick').value.trim();
    const Number = parseInt(document.getElementById('edit-number').value.trim(), 10);
    const NovelTitle = document.getElementById('edit-title').value.trim();
    if (!NickName || !NovelTitle || isNaN(Number)) return alert('昵称、章节号、小说名不能为空');
    if (id) {
        // 编辑
        fetch(config.apiBaseUrl + 'novels', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{ id: Number(id), NickName, Number, NovelTitle }])
        }).then(() => { hideEditModal(); fetchNovels(); });
    } else {
        // 新增
        fetch(config.apiBaseUrl + 'novels', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify([{ NickName, Number, NovelTitle }])
        }).then(() => { hideEditModal(); fetchNovels(); });
    }
};

window.editRow = function (id) {
    const row = novels.find(n => n.id === id);
    showEditModal(row);
};
window.deleteRow = function (id) {
    if (!confirm('确定删除？')) return;
    fetch(config.apiBaseUrl + 'novels', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([id])
    }).then(() => fetchNovels());
};

function showEditModal(row) {
    document.getElementById('edit-nick').value = row ? row.NickName : '';
    document.getElementById('edit-number').value = row ? row.Number : '';
    document.getElementById('edit-title').value = row ? row.NovelTitle : '';
    document.getElementById('save-edit-btn').dataset.id = row ? row.id : '';
    document.getElementById('modal-title').textContent = row ? '编辑小说' : '新增小说';
    document.getElementById('edit-modal').classList.remove('hidden');
}
function hideEditModal() {
    document.getElementById('edit-modal').classList.add('hidden');
}

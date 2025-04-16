const apiBase = '/api/comments/paged';
let page = 1, pageSize = 20, total = 0, filter = {};

function fetchComments() {
    const params = new URLSearchParams({
        page, pageSize,
        wxNickName: filter.nick || '',
        novelTitle: filter.title || '',
        number: filter.number || ''
    });
    fetch(apiBase + '?' + params)
        .then(res => res.json())
        .then(data => {
            total = data.total;
            renderTable(data.data);
            renderPagination();
        });
}

function renderTable(list) {
    const tbody = document.getElementById('comment-tbody');
    tbody.innerHTML = '';
    list.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
      <td><input type="checkbox" data-id="${row.id}"></td>
      <td>${row.wxNickName}</td>
      <td>${row.novelTitle}</td>
      <td>${row.number}</td>
      <td class="ellipsis" title="${row.commentText}">${row.commentText}</td>
      <td>${row.createTime}</td>
      <td>
        <button onclick="editRow(${row.id})">编辑</button>
        <button onclick="deleteRow(${row.id})">删除</button>
      </td>
    `;
        // 单行省略，点击展开
        tr.querySelector('.ellipsis').onclick = function () {
            if (this.style.whiteSpace === 'normal') {
                this.style.whiteSpace = 'nowrap';
                this.style.overflow = 'hidden';
                this.style.textOverflow = 'ellipsis';
            } else {
                this.style.whiteSpace = 'normal';
                this.style.overflow = 'visible';
                this.style.textOverflow = 'unset';
            }
        };
        tbody.appendChild(tr);
    });
}

function renderPagination() {
    const totalPages = Math.ceil(total / pageSize);
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="${i === page ? 'active' : ''}" onclick="gotoPage(${i})">${i}</button>`;
    }
    document.getElementById('pagination').innerHTML = html;
}

window.gotoPage = function (p) {
    page = p;
    fetchComments();
};

document.getElementById('filter-btn').onclick = function () {
    filter.nick = document.getElementById('filter-nick').value.trim();
    filter.title = document.getElementById('filter-title').value.trim();
    filter.number = document.getElementById('filter-number').value.trim();
    page = 1;
    fetchComments();
};

document.getElementById('page-size').onchange = function () {
    pageSize = parseInt(this.value, 10);
    page = 1;
    fetchComments();
};

document.getElementById('select-all').onclick = function () {
    document.querySelectorAll('#comment-tbody input[type=checkbox]').forEach(cb => cb.checked = this.checked);
};

document.getElementById('batch-del-btn').onclick = function () {
    const ids = Array.from(document.querySelectorAll('#comment-tbody input[type=checkbox]:checked')).map(cb => cb.dataset.id);
    if (!ids.length) return alert('请选择要删除的评论');
    if (!confirm('确定批量删除？')) return;
    fetch('/api/comments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ids.map(Number))
    }).then(() => fetchComments());
};

// 编辑、删除、保存等函数
window.editRow = function (id) {
    // 省略：弹窗赋值、保存逻辑，可根据需要补充
    alert('请补充编辑弹窗逻辑');
};
window.deleteRow = function (id) {
    if (!confirm('确定删除？')) return;
    fetch('/api/comments/' + id, { method: 'DELETE' }).then(() => fetchComments());
};

fetchComments(); 
let config = {};
fetch('config.json').then(res => res.json()).then(cfg => { config = cfg; fetchComments(); });

let page = 1, pageSize = 20, total = 0, filter = {};

function fetchComments() {
    const params = new URLSearchParams({
        page, pageSize,
        wxNickName: filter.nick || '',
        novelTitle: filter.title || '',
        number: filter.number || ''
    });
    fetch(config.apiBaseUrl + 'comments/paged?' + params)
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

window.changePageSize = function (size) {
    pageSize = parseInt(size, 10);
    page = 1;
    fetchComments();
};

window.gotoPage = function (p) {
    if (p < 1) p = 1;
    const totalPages = Math.ceil(total / pageSize);
    if (p > totalPages) p = totalPages;
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

document.getElementById('select-all').onclick = function () {
    document.querySelectorAll('#comment-tbody input[type=checkbox]').forEach(cb => cb.checked = this.checked);
};

document.getElementById('batch-del-btn').onclick = function () {
    const ids = Array.from(document.querySelectorAll('#comment-tbody input[type=checkbox]:checked')).map(cb => cb.dataset.id);
    if (!ids.length) return alert('请选择要删除的评论');
    if (!confirm('确定批量删除？')) return;
    fetch(config.apiBaseUrl + 'comments', {
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
    fetch(config.apiBaseUrl + 'comments/' + id, { method: 'DELETE' }).then(() => fetchComments());
};

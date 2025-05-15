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
    fetchUsers();
}; 
// 全局变量
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let apiBaseUrl = '';
let selectedComments = new Set(); // 存储已选择的评论ID
let selectedNovels = new Set(); // 存储已选择的小说ID
let novelCurrentPage = 1;
let novelTotalPages = 1;

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', async function () {
    // 加载配置
    await loadConfig();

    // 导航菜单切换
    setupNavigation();

    // 加载仪表盘数据
    loadDashboard();

    // 加载评论数据
    setupCommentManagement();

    // 设置小说管理
    setupNovelsManagement();

    // 设置配置管理
    setupSettingsManagement();
});

// 加载配置
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error('无法加载配置文件');
        }
        const config = await response.json();
        apiBaseUrl = config.apiBaseUrl;
    } catch (error) {
        console.error('加载配置失败:', error);
        showAlert('加载配置失败，请刷新页面重试。', 'danger');
    }
}

// 设置导航菜单
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-page]');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // 移除所有导航链接的活动状态
            navLinks.forEach(link => link.classList.remove('active'));

            // 添加当前链接的活动状态
            this.classList.add('active');

            // 获取要显示的页面ID
            const pageId = this.getAttribute('data-page');

            // 隐藏所有内容页面
            document.querySelectorAll('.content-page').forEach(page => {
                page.classList.add('d-none');
            });

            // 显示选定的页面
            document.getElementById(pageId).classList.remove('d-none');

            // 如果切换到评论管理页面，加载评论数据
            if (pageId === 'comments') {
                loadComments(1);
            }

            // 如果切换到配置管理页面，加载配置数据
            if (pageId === 'settings') {
                loadSettings();
            }
        });
    });
}

// 加载仪表盘数据
async function loadDashboard() {
    try {
        // 加载评论总数
        const commentsResponse = await fetch(`${apiBaseUrl}comments?page=1&pageSize=1`);
        if (commentsResponse.ok) {
            const commentsData = await commentsResponse.json();
            document.getElementById('total-comments').textContent = commentsData.total || 0;
        }

        // 加载当前赛季
        const seasonResponse = await fetch(`${apiBaseUrl}settings/competition_number`);
        if (seasonResponse.ok) {
            const seasonData = await seasonResponse.json();
            const currentSeason = seasonData.data.Value;
            document.getElementById('current-season').textContent = currentSeason;
        } else {
            document.getElementById('current-season').textContent = "未设置";
        }

        // 加载最近评论
        const recentCommentsResponse = await fetch(`${apiBaseUrl}comments?page=1&pageSize=5`);
        if (recentCommentsResponse.ok) {
            const recentCommentsData = await recentCommentsResponse.json();
            const recentCommentsList = document.getElementById('recent-comments-list');
            recentCommentsList.innerHTML = '';

            if (recentCommentsData.data && recentCommentsData.data.length > 0) {
                recentCommentsData.data.forEach(comment => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
            <td>${comment.WxNickName || ''}</td>
            <td>${comment.NovelTitle || ''}</td>
            <td><div class="comment-text-single-line">${comment.CommentText || ''}</div></td>
            <td>${comment.CreateTime || ''}</td>
          `;
                    recentCommentsList.appendChild(row);

                    // 添加评论内容点击事件
                    const commentTextDiv = row.querySelector('.comment-text-single-line');
                    commentTextDiv.addEventListener('click', function () {
                        if (this.classList.contains('comment-text-single-line')) {
                            this.classList.remove('comment-text-single-line');
                            this.classList.add('comment-text-expanded');
                        } else {
                            this.classList.remove('comment-text-expanded');
                            this.classList.add('comment-text-single-line');
                        }
                    });
                });
            } else {
                recentCommentsList.innerHTML = '<tr><td colspan="4" class="text-center">暂无评论数据</td></tr>';
            }
        }

        // 统计不同小说标题数量
        const statisticsResponse = await fetch(`${apiBaseUrl}static?groupType=2&sortType=0`);
        if (statisticsResponse.ok) {
            const statisticsData = await statisticsResponse.json();
            document.getElementById('total-novels').textContent = statisticsData.length || 0;
        }
    } catch (error) {
        console.error('加载仪表盘数据失败:', error);
        showAlert('加载仪表盘数据失败，请稍后重试。', 'danger');
    }
}

// 设置评论管理
function setupCommentManagement() {
    // 加载评论列表
    loadComments(1);

    // 设置搜索按钮事件
    document.getElementById('search-btn').addEventListener('click', function () {
        loadComments(1);
    });

    // 设置日期筛选按钮事件
    document.getElementById('date-search-btn').addEventListener('click', function () {
        loadComments(1);
    });

    // 设置重置搜索按钮事件
    document.getElementById('reset-search-btn').addEventListener('click', function () {
        document.getElementById('search-wxNickName').value = '';
        document.getElementById('search-novelTitle').value = '';
        document.getElementById('search-number').value = '';
        document.getElementById('search-startDate').value = '';
        document.getElementById('search-endDate').value = '';
        loadComments(1);
    });

    // 为搜索字段添加回车键搜索功能
    const searchFields = ['search-wxNickName', 'search-novelTitle', 'search-number'];
    searchFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                loadComments(1);
            }
        });
    });

    // 添加评论模态框相关事件
    document.getElementById('add-comment-text').addEventListener('input', function () {
        const charCount = this.value.length;
        document.getElementById('add-char-count').textContent = charCount;

        // 更新表单验证状态
        if (charCount < 50) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });

    // 编辑评论模态框相关事件
    document.getElementById('edit-comment-text').addEventListener('input', function () {
        const charCount = this.value.length;
        document.getElementById('edit-char-count').textContent = charCount;

        // 更新表单验证状态
        if (charCount < 50) {
            this.classList.add('is-invalid');
        } else {
            this.classList.remove('is-invalid');
        }
    });

    // 添加评论表单验证和提交
    document.getElementById('save-comment-btn').addEventListener('click', function () {
        const form = document.getElementById('add-comment-form');

        // 表单验证
        const wxNickname = document.getElementById('add-wx-nickname').value.trim();
        const novelTitle = document.getElementById('add-comment-novel-title').value.trim();
        const number = document.getElementById('add-number').value.trim();
        const commentText = document.getElementById('add-comment-text').value.trim();

        if (!wxNickname || !novelTitle || !number || !commentText || commentText.length < 50) {
            showAlert('请填写所有必填字段，评论内容至少需要50个字符。', 'danger');
            return;
        }

        // 提交评论
        addComment(wxNickname, novelTitle, number, commentText);
    });

    // 编辑评论提交
    document.getElementById('update-comment-btn').addEventListener('click', function () {
        const commentId = document.getElementById('edit-comment-id').value;
        const wxNickname = document.getElementById('edit-wx-nickname').value.trim();
        const commentText = document.getElementById('edit-comment-text').value.trim();

        if (!wxNickname || !commentText || commentText.length < 50) {
            showAlert('请填写所有必填字段，评论内容至少需要50个字符。', 'danger');
            return;
        }

        // 更新评论
        updateComment(commentId, wxNickname, commentText);
    });

    // 确认删除评论
    document.getElementById('confirm-delete-btn').addEventListener('click', function () {
        const commentId = document.getElementById('delete-comment-id').value;
        deleteComment(commentId);
    });

    // 初始化添加评论模态框时，自动设置当前赛季
    const addCommentModal = document.getElementById('addCommentModal');
    addCommentModal.addEventListener('show.bs.modal', async function () {
        // 获取当前赛季设置
        try {
            const response = await fetch(`${apiBaseUrl}settings/competition_number`);
            if (response.ok) {
                const result = await response.json();
                document.getElementById('add-number').value = result.data.Value;
            }
        } catch (error) {
            console.error('获取当前赛季失败:', error);
        }

        // 重置表单
        document.getElementById('add-wx-nickname').value = '';
        document.getElementById('add-comment-novel-title').value = '';
        document.getElementById('add-comment-text').value = '';
        document.getElementById('add-char-count').textContent = '0';
    });

    // 设置全选/取消全选
    document.getElementById('select-all-comments').addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.comment-checkbox');
        const isChecked = this.checked;

        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const commentId = parseInt(checkbox.getAttribute('data-id'));

            if (isChecked) {
                selectedComments.add(commentId);
            } else {
                selectedComments.delete(commentId);
            }
        });

        updateBatchOperations();
    });

    // 设置批量删除按钮事件
    document.getElementById('batch-delete-btn').addEventListener('click', function () {
        openBatchDeleteModal();
    });

    // 确认批量删除
    document.getElementById('confirm-batch-delete-btn').addEventListener('click', function () {
        batchDeleteComments();
    });
}

// 加载评论列表
async function loadComments(page) {
    try {
        currentPage = page;

        // 获取所有搜索条件
        const wxNickName = document.getElementById('search-wxNickName').value.trim();
        const novelTitle = document.getElementById('search-novelTitle').value.trim();
        const number = document.getElementById('search-number').value.trim();
        const startDate = document.getElementById('search-startDate').value.trim();
        const endDate = document.getElementById('search-endDate').value.trim();

        let url = `${apiBaseUrl}comments?page=${page}&pageSize=${pageSize}`;

        // 添加搜索条件到URL
        if (wxNickName) {
            url += `&wxNickName=${encodeURIComponent(wxNickName)}`;
        }

        if (novelTitle) {
            url += `&novelTitle=${encodeURIComponent(novelTitle)}`;
        }

        if (number) {
            url += `&number=${encodeURIComponent(number)}`;
        }

        // 添加日期范围条件
        if (startDate) {
            url += `&startTime=${encodeURIComponent(startDate + ' 00:00:00')}`;
        }

        if (endDate) {
            // 添加23:59:59以包含整个结束日期
            url += `&endTime=${encodeURIComponent(endDate + ' 23:59:59')}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('获取评论列表失败');
        }

        const data = await response.json();
        totalPages = Math.ceil(data.total / pageSize);

        // 更新评论列表
        const commentsList = document.getElementById('comments-list');
        commentsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(comment => {
                const row = document.createElement('tr');
                row.innerHTML = `
          <td>
            <div class="form-check">
              <input class="form-check-input comment-checkbox" type="checkbox" data-id="${comment.ID}" title="选择此评论" aria-label="选择评论">
            </div>
          </td>
          <td>${comment.WxNickName || ''}</td>
          <td>${comment.Number || ''}</td>
          <td>${comment.NovelTitle || ''}</td>
          <td>
            <div class="comment-text-single-line" data-comment-id="${comment.ID}">${comment.CommentText || ''}</div>
          </td>
          <td>${comment.CreateTime || ''}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${comment.ID})">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="openDeleteModal(${comment.ID})">
              <i class="bi bi-trash"></i>
            </button>
          </td>
        `;

                commentsList.appendChild(row);

                // 为新添加的复选框绑定事件
                const checkbox = row.querySelector('.comment-checkbox');
                checkbox.addEventListener('change', function () {
                    const commentId = parseInt(this.getAttribute('data-id'));

                    if (this.checked) {
                        selectedComments.add(commentId);
                    } else {
                        selectedComments.delete(commentId);
                        // 如果取消选中某个项，则取消全选状态
                        document.getElementById('select-all-comments').checked = false;
                    }

                    updateBatchOperations();
                });

                // 添加评论内容点击事件
                const commentTextDiv = row.querySelector('.comment-text-single-line');
                commentTextDiv.addEventListener('click', function () {
                    if (this.classList.contains('comment-text-single-line')) {
                        this.classList.remove('comment-text-single-line');
                        this.classList.add('comment-text-expanded');
                    } else {
                        this.classList.remove('comment-text-expanded');
                        this.classList.add('comment-text-single-line');
                    }
                });
            });
        } else {
            commentsList.innerHTML = '<tr><td colspan="7" class="text-center">暂无评论数据</td></tr>';
        }

        // 重置选中状态
        selectedComments.clear();
        document.getElementById('select-all-comments').checked = false;
        updateBatchOperations();

        // 更新分页
        updatePagination();
    } catch (error) {
        console.error('加载评论失败:', error);
        showAlert('加载评论失败，请稍后重试。', 'danger');
    }
}

// 更新分页控件
function updatePagination() {
    const pagination = document.getElementById('comments-pagination');
    pagination.innerHTML = '';

    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
    <a class="page-link" href="#" aria-label="Previous" ${currentPage > 1 ? `onclick="loadComments(${currentPage - 1}); return false;"` : ''}>
      <span aria-hidden="true">&laquo;</span>
    </a>
  `;
    pagination.appendChild(prevLi);

    // 页码按钮
    const pageRange = getPageRange(totalPages, currentPage, 5);
    pageRange.forEach(pageNum => {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${pageNum === currentPage ? 'active' : ''}`;
        pageLi.innerHTML = `
      <a class="page-link" href="#" onclick="loadComments(${pageNum}); return false;">${pageNum}</a>
    `;
        pagination.appendChild(pageLi);
    });

    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
    <a class="page-link" href="#" aria-label="Next" ${currentPage < totalPages ? `onclick="loadComments(${currentPage + 1}); return false;"` : ''}>
      <span aria-hidden="true">&raquo;</span>
    </a>
  `;
    pagination.appendChild(nextLi);
}

// 计算要显示的页码范围
function getPageRange(totalPages, currentPage, displayCount) {
    if (displayCount % 2 === 0) {
        displayCount++;
    }

    const halfDisplay = Math.floor(displayCount / 2);
    let startPage = Math.max(1, currentPage - halfDisplay);
    let endPage = Math.min(totalPages, currentPage + halfDisplay);

    if (startPage > 1 && endPage < totalPages) {
        // 调整以显示更多页码
        if (currentPage - startPage < halfDisplay) {
            endPage = Math.min(totalPages, endPage + (halfDisplay - (currentPage - startPage)));
        } else if (endPage - currentPage < halfDisplay) {
            startPage = Math.max(1, startPage - (halfDisplay - (endPage - currentPage)));
        }
    }

    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }
    return pages;
}

// 添加评论
async function addComment(wxNickname, novelTitle, number, commentText) {
    try {
        // 检查小说标题是否合法
        const checkNovelResponse = await fetch(`${apiBaseUrl}checknovel?number=${number}&novelTitle=《${novelTitle}》`);
        const checkNovelData = await checkNovelResponse.json();

        if (!checkNovelData.exists) {
            document.getElementById('add-comment-novel-title').classList.add('is-invalid');
            document.getElementById('novel-title-feedback').textContent = '小说标题不在当前赛季目录中';
            return;
        }

        // 创建评论
        const response = await fetch(`${apiBaseUrl}addcomments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                WxNickName: wxNickname,
                NovelTitle: `《${novelTitle}》`,
                Number: parseInt(number),
                CommentText: commentText
            })
        });

        if (!response.ok) {
            throw new Error('添加评论失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addCommentModal'));
        modal.hide();

        // 刷新评论列表
        loadComments(1);

        // 显示成功消息
        showAlert('评论添加成功！', 'success');

        // 刷新仪表盘
        loadDashboard();
    } catch (error) {
        console.error('添加评论失败:', error);
        showAlert('添加评论失败，请稍后重试。', 'danger');
    }
}

// 打开编辑评论模态框
async function openEditModal(commentId) {
    try {
        // 获取评论数据
        const response = await fetch(`${apiBaseUrl}comments?page=1&pageSize=1000`);
        if (!response.ok) {
            throw new Error('获取评论数据失败');
        }

        const data = await response.json();
        const comment = data.data.find(c => c.ID === commentId);

        if (!comment) {
            throw new Error('未找到评论');
        }

        // 填充表单
        document.getElementById('edit-comment-id').value = comment.ID;
        document.getElementById('edit-wx-nickname').value = comment.WxNickName;
        document.getElementById('edit-novel-title').value = comment.NovelTitle;
        document.getElementById('edit-number').value = comment.Number;
        document.getElementById('edit-comment-text').value = comment.CommentText;
        document.getElementById('edit-char-count').textContent = comment.CommentText.length;

        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('editCommentModal'));
        modal.show();
    } catch (error) {
        console.error('打开编辑模态框失败:', error);
        showAlert('获取评论数据失败，请稍后重试。', 'danger');
    }
}

// 更新评论
async function updateComment(commentId, wxNickname, commentText) {
    try {
        const response = await fetch(`${apiBaseUrl}comments/${commentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                WxNickName: wxNickname,
                CommentText: commentText
            })
        });

        if (!response.ok) {
            throw new Error('更新评论失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('editCommentModal'));
        modal.hide();

        // 刷新评论列表
        loadComments(currentPage);

        // 显示成功消息
        showAlert('评论更新成功！', 'success');
    } catch (error) {
        console.error('更新评论失败:', error);
        showAlert('更新评论失败，请稍后重试。', 'danger');
    }
}

// 打开删除确认模态框
function openDeleteModal(commentId) {
    document.getElementById('delete-comment-id').value = commentId;
    const modal = new bootstrap.Modal(document.getElementById('deleteCommentModal'));
    modal.show();
}

// 删除评论
async function deleteComment(commentId) {
    try {
        const response = await fetch(`${apiBaseUrl}comments/${commentId}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('删除评论失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteCommentModal'));
        modal.hide();

        // 刷新评论列表
        loadComments(currentPage);

        // 显示成功消息
        showAlert('评论删除成功！', 'success');

        // 刷新仪表盘
        loadDashboard();
    } catch (error) {
        console.error('删除评论失败:', error);
        showAlert('删除评论失败，请稍后重试。', 'danger');
    }
}

// 设置小说管理
function setupNovelsManagement() {
    // 加载小说列表
    loadNovels(1);

    // 设置搜索按钮事件
    document.getElementById('novel-search-btn').addEventListener('click', function () {
        loadNovels(1);
    });

    // 设置重置搜索按钮事件
    document.getElementById('reset-novel-search-btn').addEventListener('click', function () {
        document.getElementById('search-novel-title').value = '';
        document.getElementById('search-novel-number').value = '';
        document.getElementById('search-novel-author').value = '';
        loadNovels(1);
    });

    // 为搜索字段添加回车键搜索功能
    const searchFields = ['search-novel-title', 'search-novel-number', 'search-novel-author'];
    searchFields.forEach(fieldId => {
        document.getElementById(fieldId).addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                loadNovels(1);
            }
        });
    });

    // 添加小说模态框相关事件
    document.getElementById('save-novel-btn').addEventListener('click', function () {
        // 调试表单元素是否存在
        const titleInput = document.getElementById('add-novel-title');
        const numberInput = document.getElementById('add-novel-number');
        const authorInput = document.getElementById('add-novel-author');

        console.log('添加小说表单元素:', {
            titleExists: !!titleInput,
            numberExists: !!numberInput,
            authorExists: !!authorInput
        });

        if (titleInput && numberInput && authorInput) {
            console.log('表单值:', {
                title: titleInput.value,
                number: numberInput.value,
                author: authorInput.value
            });
        }

        addNovel();
    });

    // 初始化添加小说模态框时，自动设置当前赛季
    const addNovelModal = document.getElementById('addNovelModal');
    addNovelModal.addEventListener('show.bs.modal', async function () {
        // 获取当前赛季设置
        try {
            const response = await fetch(`${apiBaseUrl}settings/competition_number`);
            if (response.ok) {
                const result = await response.json();
                document.getElementById('add-novel-number').value = result.data.Value;
            }
        } catch (error) {
            console.error('获取当前赛季失败:', error);
        }

        // 重置表单
        document.getElementById('add-novel-title').value = '';
        document.getElementById('add-novel-author').value = '';
    });

    // 批量添加小说
    document.getElementById('batch-save-novel-btn').addEventListener('click', function () {
        batchAddNovels();
    });

    // 更新小说
    document.getElementById('update-novel-btn').addEventListener('click', function () {
        updateNovel();
    });

    // 确认删除小说
    document.getElementById('confirm-delete-novel-btn').addEventListener('click', function () {
        deleteNovel();
    });

    // 设置全选/取消全选
    document.getElementById('select-all-novels').addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.novel-checkbox');
        const isChecked = this.checked;

        checkboxes.forEach(checkbox => {
            checkbox.checked = isChecked;
            const novelId = parseInt(checkbox.getAttribute('data-id'));

            if (isChecked) {
                selectedNovels.add(novelId);
            } else {
                selectedNovels.delete(novelId);
            }
        });

        updateNovelBatchOperations();
    });

    // 设置批量删除按钮事件
    document.getElementById('batch-delete-novels-btn').addEventListener('click', function () {
        openBatchDeleteNovelsModal();
    });

    // 确认批量删除
    document.getElementById('confirm-batch-delete-novels-btn').addEventListener('click', function () {
        batchDeleteNovels();
    });
}

// 加载小说列表
async function loadNovels(page) {
    try {
        novelCurrentPage = page;

        // 获取所有搜索条件
        const novelTitle = document.getElementById('search-novel-title').value.trim();
        const number = document.getElementById('search-novel-number').value.trim();
        const author = document.getElementById('search-novel-author').value.trim();

        let url = `${apiBaseUrl}novels?page=${page}&pageSize=${pageSize}`;

        // 添加搜索条件到URL
        if (novelTitle) {
            url += `&novelTitle=${encodeURIComponent(novelTitle)}`;
        }

        if (number) {
            url += `&number=${encodeURIComponent(number)}`;
        }

        if (author) {
            url += `&author=${encodeURIComponent(author)}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('获取小说列表失败');
        }

        const data = await response.json();
        novelTotalPages = Math.ceil(data.total / pageSize);

        // 更新小说列表
        const novelsList = document.getElementById('novels-list');
        novelsList.innerHTML = '';

        if (data.data && data.data.length > 0) {
            data.data.forEach(novel => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="form-check">
                            <input class="form-check-input novel-checkbox" type="checkbox" data-id="${novel.ID}" title="选择此小说" aria-label="选择小说">
                        </div>
                    </td>
                    <td>${novel.NovelTitle || ''}</td>
                    <td>${novel.Number || ''}</td>
                    <td>${novel.Author || ''}</td>
                    <td>${novel.CreateTime || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditNovelModal(${novel.ID})">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="openDeleteNovelModal(${novel.ID})">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;

                novelsList.appendChild(row);

                // 为新添加的复选框绑定事件
                const checkbox = row.querySelector('.novel-checkbox');
                checkbox.addEventListener('change', function () {
                    const novelId = parseInt(this.getAttribute('data-id'));

                    if (this.checked) {
                        selectedNovels.add(novelId);
                    } else {
                        selectedNovels.delete(novelId);
                        // 如果取消选中某个项，则取消全选状态
                        document.getElementById('select-all-novels').checked = false;
                    }

                    updateNovelBatchOperations();
                });
            });
        } else {
            novelsList.innerHTML = '<tr><td colspan="6" class="text-center">暂无小说数据</td></tr>';
        }

        // 重置选中状态
        selectedNovels.clear();
        document.getElementById('select-all-novels').checked = false;
        updateNovelBatchOperations();

        // 更新分页
        updateNovelsPagination();
    } catch (error) {
        console.error('加载小说失败:', error);
        showAlert('加载小说失败，请稍后重试。', 'danger');
    }
}

// 更新小说分页控件
function updateNovelsPagination() {
    const pagination = document.getElementById('novels-pagination');
    pagination.innerHTML = '';

    // 上一页按钮
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${novelCurrentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Previous" ${novelCurrentPage > 1 ? `onclick="loadNovels(${novelCurrentPage - 1}); return false;"` : ''}>
            <span aria-hidden="true">&laquo;</span>
        </a>
    `;
    pagination.appendChild(prevLi);

    // 页码按钮
    const pageRange = getPageRange(novelTotalPages, novelCurrentPage, 5);
    pageRange.forEach(pageNum => {
        const pageLi = document.createElement('li');
        pageLi.className = `page-item ${pageNum === novelCurrentPage ? 'active' : ''}`;
        pageLi.innerHTML = `
            <a class="page-link" href="#" onclick="loadNovels(${pageNum}); return false;">${pageNum}</a>
        `;
        pagination.appendChild(pageLi);
    });

    // 下一页按钮
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${novelCurrentPage === novelTotalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `
        <a class="page-link" href="#" aria-label="Next" ${novelCurrentPage < novelTotalPages ? `onclick="loadNovels(${novelCurrentPage + 1}); return false;"` : ''}>
            <span aria-hidden="true">&raquo;</span>
        </a>
    `;
    pagination.appendChild(nextLi);
}

// 添加小说
async function addNovel() {
    try {
        const title = document.getElementById('add-novel-title').value.trim();
        const numberStr = document.getElementById('add-novel-number').value.trim();
        const author = document.getElementById('add-novel-author').value.trim();

        console.log('提交小说表单数据:', { title, numberStr, author });

        // 更精确的验证判断
        if (title === '' || numberStr === '' || author === '') {
            showAlert('请填写所有必填字段', 'danger');
            return;
        }

        // 将届数转换为数字
        const number = parseInt(numberStr);
        if (isNaN(number)) {
            showAlert('届数必须是有效的数字', 'danger');
            return;
        }

        const requestData = {
            NovelTitle: title,
            Number: number,
            Author: author
        };

        console.log('发送的小说数据:', requestData);

        const response = await fetch(`${apiBaseUrl}novels`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('小说添加API响应状态:', response.status);

        if (!response.ok) {
            const errorData = await response.json();
            console.error('小说添加API错误响应:', errorData);
            throw new Error(errorData.error || '添加小说失败');
        }

        const result = await response.json();
        console.log('小说添加成功:', result);

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addNovelModal'));
        modal.hide();

        // 刷新小说列表
        loadNovels(1);

        // 显示成功消息
        showAlert('小说添加成功！', 'success');
    } catch (error) {
        console.error('添加小说失败:', error);
        showAlert(`添加小说失败: ${error.message}`, 'danger');
    }
}

// 批量添加小说
async function batchAddNovels() {
    try {
        const data = document.getElementById('batch-novel-data').value.trim();
        if (!data) {
            showAlert('请输入小说数据', 'danger');
            return;
        }

        const lines = data.split('\n');
        const novels = [];

        for (const line of lines) {
            if (!line.trim()) continue;

            const parts = line.split(',');
            if (parts.length < 3) {
                showAlert(`格式错误: ${line}，请按照"小说标题,届数,作者"的格式输入`, 'warning');
                continue;
            }

            const title = parts[0].trim();
            const numberStr = parts[1].trim();
            const author = parts[2].trim();

            // 更精确的验证
            if (title === '' || numberStr === '' || author === '') {
                showAlert(`数据错误: ${line}，请确保所有字段不为空`, 'warning');
                continue;
            }

            const number = parseInt(numberStr);
            if (isNaN(number)) {
                showAlert(`数据错误: ${line}，届数必须是有效的数字`, 'warning');
                continue;
            }

            novels.push({
                NovelTitle: title,
                Number: number,
                Author: author
            });
        }

        if (novels.length === 0) {
            showAlert('没有有效的小说数据', 'warning');
            return;
        }

        const response = await fetch(`${apiBaseUrl}novels/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(novels)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '批量添加小说失败');
        }

        const result = await response.json();

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchAddNovelModal'));
        modal.hide();

        // 清空批量添加表单
        document.getElementById('batch-novel-data').value = '';

        // 刷新小说列表
        loadNovels(1);

        // 显示成功消息
        showAlert(result.message, 'success');
    } catch (error) {
        console.error('批量添加小说失败:', error);
        showAlert(`批量添加小说失败: ${error.message}`, 'danger');
    }
}

// 打开编辑小说模态框
function openEditNovelModal(novelId) {
    console.log('正在获取小说ID:', novelId, '的详情');
    
    // 清空表单，避免上次编辑的数据残留
    document.getElementById('edit-novel-id').value = '';
    document.getElementById('edit-novel-title').value = '';
    document.getElementById('edit-novel-number').value = '';
    document.getElementById('edit-novel-author').value = '';
    
    // 仅使用专门的API获取小说详情，确保数据准确性
    fetch(`${apiBaseUrl}novels/${novelId}`)
        .then(response => {
            console.log('API响应状态:', response.status);
            if (!response.ok) {
                throw new Error(`获取小说详情失败: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log('API返回小说数据:', result);
            
            if (result.data) {
                const novel = result.data;
                console.log('获取到小说数据:', novel);
                
                // 填充表单
                document.getElementById('edit-novel-id').value = novel.ID;
                document.getElementById('edit-novel-title').value = novel.NovelTitle || '';
                document.getElementById('edit-novel-number').value = novel.Number || '';
                document.getElementById('edit-novel-author').value = novel.Author || '';
                
                // 检查并记录表单是否正确填充
                const titleElement = document.getElementById('edit-novel-title');
                console.log('表单标题元素值:', titleElement.value);
                
                // 确保表单元素有值后再显示模态框
                setTimeout(() => {
                    // 显示模态框
                    const modal = new bootstrap.Modal(document.getElementById('editNovelModal'));
                    modal.show();
                }, 100);
            }
        })
        .catch(error => {
            console.error('打开编辑模态框失败:', error);
            showAlert('获取小说数据失败，请稍后重试。', 'danger');
        });
}

// 无需后备方法，已简化为使用直接API获取小说数据

// 更新小说
async function updateNovel() {
    try {        // 直接获取DOM元素，检查元素是否存在        const idInput = document.getElementById('edit-novel-id');        const titleInput = document.getElementById('edit-novel-title');        const numberInput = document.getElementById('edit-novel-number');        const authorInput = document.getElementById('edit-novel-author');        console.log('表单元素检查:', {            idExists: !!idInput,            titleExists: !!titleInput,            numberExists: !!numberInput,            authorExists: !!authorInput        });        if (!idInput || !titleInput || !numberInput || !authorInput) {            showAlert('表单元素不完整，请刷新页面重试', 'danger');            return;        }        // 强制从DOM中重新获取最新的表单值        const title = titleInput.value.trim();        const numberStr = numberInput.value.trim();        const author = authorInput.value.trim();        const id = idInput.value;        console.log('编辑框中获取的表单值:', {            idValue: id,            titleValue: title,            numberValue: numberStr,            authorValue: author        });

        console.log('处理后的表单数据:', { id, title, numberStr, author });

        // 更精确的验证判断
        if (title === '' || numberStr === '' || author === '') {
            showAlert('请填写所有必填字段', 'danger');
            console.error('表单验证失败,空字段:', { title, numberStr, author });
            return;
        }

        // 将届数转换为数字
        const number = parseInt(numberStr);
        if (isNaN(number)) {
            showAlert('届数必须是有效的数字', 'danger');
            console.error('届数验证失败:', numberStr);
            return;
        }

        // 准备请求数据
        const requestData = {
            NovelTitle: title,  // 正确的大写字段名
            Number: number,
            Author: author
        };

        console.log('发送的更新数据:', JSON.stringify(requestData));

        // 执行更新请求
        const url = `${apiBaseUrl}novels/${id}`;
        console.log('发送请求到:', url);

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        console.log('小说更新API响应状态:', response.status);
        const responseText = await response.text();
        console.log('API原始响应:', responseText);

        // 尝试解析响应为JSON
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('解析后的响应数据:', result);
        } catch (e) {
            console.error('响应不是有效的JSON:', e);
            throw new Error('服务器返回了无效的响应格式');
        }

        if (!response.ok) {
            throw new Error(result.error || '更新小说失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('editNovelModal'));
        modal.hide();

        // 刷新小说列表
        loadNovels(novelCurrentPage);

        // 显示成功消息
        showAlert('小说更新成功！', 'success');
    } catch (error) {
        console.error('更新小说失败:', error);
        showAlert(`更新小说失败: ${error.message}`, 'danger');
    }
}

// 打开删除确认模态框
function openDeleteNovelModal(novelId) {
    document.getElementById('delete-novel-id').value = novelId;
    const modal = new bootstrap.Modal(document.getElementById('deleteNovelModal'));
    modal.show();
}

// 删除小说
async function deleteNovel() {
    try {
        const id = document.getElementById('delete-novel-id').value;

        const response = await fetch(`${apiBaseUrl}novels/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '删除小说失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteNovelModal'));
        modal.hide();

        // 刷新小说列表
        loadNovels(novelCurrentPage);

        // 显示成功消息
        showAlert('小说删除成功！', 'success');
    } catch (error) {
        console.error('删除小说失败:', error);
        showAlert(`删除小说失败: ${error.message}`, 'danger');
    }
}

// 更新批量操作按钮状态
function updateNovelBatchOperations() {
    const count = selectedNovels.size;
    document.getElementById('selected-novels-count').textContent = `已选择 ${count} 项`;
    document.getElementById('batch-delete-novels-btn').disabled = count === 0;
}

// 打开批量删除确认模态框
function openBatchDeleteNovelsModal() {
    const count = selectedNovels.size;
    document.getElementById('batch-delete-novels-count').textContent = count;
    document.getElementById('batch-delete-novels-ids').value = Array.from(selectedNovels).join(',');

    const modal = new bootstrap.Modal(document.getElementById('batchDeleteNovelsModal'));
    modal.show();
}

// 批量删除小说
async function batchDeleteNovels() {
    try {
        const idsArray = Array.from(selectedNovels);

        // 逐个删除小说
        for (const id of idsArray) {
            const response = await fetch(`${apiBaseUrl}novels/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`删除小说ID ${id} 失败`);
            }
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchDeleteNovelsModal'));
        modal.hide();

        // 刷新小说列表
        loadNovels(novelCurrentPage);

        // 显示成功消息
        showAlert(`成功删除 ${idsArray.length} 本小说！`, 'success');

        // 清空选中状态
        selectedNovels.clear();
        updateNovelBatchOperations();
    } catch (error) {
        console.error('批量删除小说失败:', error);
        showAlert('批量删除小说失败，请稍后重试。', 'danger');
    }
}

// 设置配置管理
function setupSettingsManagement() {
    // 加载配置列表
    loadSettings();

    // 添加配置
    document.getElementById('save-setting-btn').addEventListener('click', function () {
        const key = document.getElementById('add-setting-key').value.trim();
        const value = document.getElementById('add-setting-value').value.trim();
        const desc = document.getElementById('add-setting-desc').value.trim();

        if (!key || !value) {
            showAlert('配置键和配置值不能为空', 'danger');
            return;
        }

        addSetting(key, value, desc);
    });

    // 更新配置
    document.getElementById('update-setting-btn').addEventListener('click', function () {
        const key = document.getElementById('edit-setting-key').value;
        const value = document.getElementById('edit-setting-value').value.trim();
        const desc = document.getElementById('edit-setting-desc').value.trim();

        if (!value) {
            showAlert('配置值不能为空', 'danger');
            return;
        }

        updateSetting(key, value, desc);
    });

    // 删除配置
    document.getElementById('confirm-delete-setting-btn').addEventListener('click', function () {
        const key = document.getElementById('delete-setting-key-input').value;
        deleteSetting(key);
    });
}

// 加载配置列表
async function loadSettings() {
    try {
        const response = await fetch(`${apiBaseUrl}settings`);
        if (!response.ok) {
            throw new Error('获取配置列表失败');
        }

        const result = await response.json();
        const settingsList = document.getElementById('settings-list');
        settingsList.innerHTML = '';

        if (result.data && result.data.length > 0) {
            result.data.forEach(setting => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${setting.Key}</td>
                    <td>
                        <div class="comment-text-single-line">${setting.Value}</div>
                    </td>
                    <td>${setting.Desc || ''}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditSettingModal('${setting.Key}')">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="openDeleteSettingModal('${setting.Key}')">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                `;

                settingsList.appendChild(row);

                // 添加配置值点击展开/收起事件
                const valueDiv = row.querySelector('.comment-text-single-line');
                valueDiv.addEventListener('click', function () {
                    if (this.classList.contains('comment-text-single-line')) {
                        this.classList.remove('comment-text-single-line');
                        this.classList.add('comment-text-expanded');
                    } else {
                        this.classList.remove('comment-text-expanded');
                        this.classList.add('comment-text-single-line');
                    }
                });
            });
        } else {
            settingsList.innerHTML = '<tr><td colspan="4" class="text-center">暂无配置数据</td></tr>';
        }
    } catch (error) {
        console.error('加载配置列表失败:', error);
        showAlert('加载配置列表失败，请稍后重试', 'danger');
    }
}

// 打开编辑配置模态框
async function openEditSettingModal(key) {
    try {
        const response = await fetch(`${apiBaseUrl}settings/${key}`);
        if (!response.ok) {
            throw new Error('获取配置详情失败');
        }

        const result = await response.json();
        const setting = result.data;

        document.getElementById('edit-setting-key').value = setting.Key;
        document.getElementById('edit-setting-key-display').value = setting.Key;
        document.getElementById('edit-setting-value').value = setting.Value;
        document.getElementById('edit-setting-desc').value = setting.Desc || '';

        const modal = new bootstrap.Modal(document.getElementById('editSettingModal'));
        modal.show();
    } catch (error) {
        console.error('获取配置详情失败:', error);
        showAlert('获取配置详情失败，请稍后重试', 'danger');
    }
}

// 打开删除配置模态框
function openDeleteSettingModal(key) {
    document.getElementById('delete-setting-key').textContent = key;
    document.getElementById('delete-setting-key-input').value = key;

    const modal = new bootstrap.Modal(document.getElementById('deleteSettingModal'));
    modal.show();
}

// 添加配置
async function addSetting(key, value, desc) {
    try {
        const response = await fetch(`${apiBaseUrl}settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                Key: key,
                Value: value,
                Desc: desc
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '添加配置失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('addSettingModal'));
        modal.hide();

        // 重置表单
        document.getElementById('add-setting-key').value = '';
        document.getElementById('add-setting-value').value = '';
        document.getElementById('add-setting-desc').value = '';

        // 刷新配置列表
        loadSettings();

        showAlert('配置添加成功', 'success');
    } catch (error) {
        console.error('添加配置失败:', error);
        showAlert(`添加配置失败: ${error.message}`, 'danger');
    }
}

// 更新配置
async function updateSetting(key, value, desc) {
    try {
        const response = await fetch(`${apiBaseUrl}settings/${key}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                value: value,
                desc: desc
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '更新配置失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('editSettingModal'));
        modal.hide();

        // 刷新配置列表
        loadSettings();

        // 如果更新的是当前赛季或小说目录，刷新仪表盘
        if (key === 'competition_number' || key === 'novel_catalogue') {
            loadDashboard();
        }

        showAlert('配置更新成功', 'success');
    } catch (error) {
        console.error('更新配置失败:', error);
        showAlert(`更新配置失败: ${error.message}`, 'danger');
    }
}

// 删除配置
async function deleteSetting(key) {
    try {
        const response = await fetch(`${apiBaseUrl}settings/${key}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || '删除配置失败');
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('deleteSettingModal'));
        modal.hide();

        // 刷新配置列表
        loadSettings();

        showAlert('配置删除成功', 'success');
    } catch (error) {
        console.error('删除配置失败:', error);
        showAlert(`删除配置失败: ${error.message}`, 'danger');
    }
}

// 显示提示消息
function showAlert(message, type) {
    // 创建提示元素
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.setAttribute('role', 'alert');
    alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

    // 添加到页面
    document.body.appendChild(alertDiv);

    // 5秒后自动移除
    setTimeout(() => {
        alertDiv.classList.remove('show');
        setTimeout(() => {
            alertDiv.remove();
        }, 300);
    }, 5000);
}

// 文本截断辅助函数
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// 更新批量操作按钮状态
function updateBatchOperations() {
    const count = selectedComments.size;
    document.getElementById('selected-count').textContent = `已选择 ${count} 项`;
    document.getElementById('batch-delete-btn').disabled = count === 0;
}

// 打开批量删除确认模态框
function openBatchDeleteModal() {
    const count = selectedComments.size;
    document.getElementById('batch-delete-count').textContent = count;
    document.getElementById('batch-delete-ids').value = Array.from(selectedComments).join(',');

    const modal = new bootstrap.Modal(document.getElementById('batchDeleteModal'));
    modal.show();
}

// 批量删除评论
async function batchDeleteComments() {
    try {
        const idsArray = Array.from(selectedComments);

        // 逐个删除评论
        for (const id of idsArray) {
            const response = await fetch(`${apiBaseUrl}comments/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error(`删除评论ID ${id} 失败`);
            }
        }

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchDeleteModal'));
        modal.hide();

        // 刷新评论列表
        loadComments(currentPage);

        // 显示成功消息
        showAlert(`成功删除 ${idsArray.length} 条评论！`, 'success');

        // 刷新仪表盘
        loadDashboard();

        // 清空选中状态
        selectedComments.clear();
        updateBatchOperations();
    } catch (error) {
        console.error('批量删除评论失败:', error);
        showAlert('批量删除评论失败，请稍后重试。', 'danger');
    }
} 
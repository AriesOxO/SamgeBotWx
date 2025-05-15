// 全局变量
let currentPage = 1;
let pageSize = 10;
let totalPages = 1;
let apiBaseUrl = '';
let currentSeason = 0;
let selectedComments = new Set(); // 存储已选择的评论ID

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

        // 获取当前赛季
        const seasonResponse = await fetch(`${apiBaseUrl}getSeason`);
        if (seasonResponse.ok) {
            const seasonData = await seasonResponse.json();
            currentSeason = seasonData.data;
        }
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
        document.getElementById('current-season').textContent = currentSeason;

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
            <td>${comment.ID}</td>
            <td>${comment.WxNickName}</td>
            <td>${comment.NovelTitle}</td>
            <td>${truncateText(comment.CommentText, 50)}</td>
            <td>${comment.CreateTime}</td>
          `;
                    recentCommentsList.appendChild(row);
                });
            } else {
                recentCommentsList.innerHTML = '<tr><td colspan="5" class="text-center">暂无评论数据</td></tr>';
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
        const novelTitle = document.getElementById('add-novel-title').value.trim();
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
    addCommentModal.addEventListener('show.bs.modal', function () {
        document.getElementById('add-number').value = currentSeason;

        // 重置表单
        document.getElementById('add-wx-nickname').value = '';
        document.getElementById('add-novel-title').value = '';
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
          <td>${comment.ID}</td>
          <td>${comment.WxNickName}</td>
          <td>${comment.Number}</td>
          <td>${comment.NovelTitle}</td>
          <td class="comment-text">${comment.CommentText}</td>
          <td>${comment.CreateTime}</td>
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
            });
        } else {
            commentsList.innerHTML = '<tr><td colspan="8" class="text-center">暂无评论数据</td></tr>';
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
            document.getElementById('add-novel-title').classList.add('is-invalid');
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

// 设置配置管理
function setupSettingsManagement() {
    document.getElementById('settings-form').addEventListener('submit', function (e) {
        e.preventDefault();

        // 获取配置值
        const competitionNumber = parseInt(document.getElementById('competition-number').value);
        const novelCatalogue = document.getElementById('novel-catalogue').value;

        // 保存配置
        saveSettings(competitionNumber, novelCatalogue);
    });
}

// 加载配置
async function loadSettings() {
    try {
        // 设置当前赛季
        document.getElementById('competition-number').value = currentSeason;

        // 获取小说目录
        const response = await fetch(`${apiBaseUrl}config`);
        if (!response.ok) {
            throw new Error('获取配置失败');
        }

        const data = await response.json();

        if (data.data) {
            const config = data.data.find(c => c.key === 'novel_catalogue');
            if (config && config.value) {
                document.getElementById('novel-catalogue').value = config.value;
            }
        }
    } catch (error) {
        console.error('加载配置失败:', error);
        showAlert('加载配置失败，请稍后重试。', 'danger');
    }
}

// 保存配置
async function saveSettings(competitionNumber, novelCatalogue) {
    try {
        // 保存赛季配置
        const seasonResponse = await fetch(`${apiBaseUrl}setSeason`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: competitionNumber
            })
        });

        // 保存小说目录
        const catalogueResponse = await fetch(`${apiBaseUrl}setCatalogue`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                catalogue: novelCatalogue
            })
        });

        // 更新全局变量
        currentSeason = competitionNumber;

        // 刷新仪表盘
        loadDashboard();

        // 显示成功消息
        showAlert('配置保存成功！', 'success');
    } catch (error) {
        console.error('保存配置失败:', error);
        showAlert('保存配置失败，请稍后重试。', 'danger');
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
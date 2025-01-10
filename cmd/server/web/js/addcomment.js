let config;

async function loadConfig() {
    const response = await fetch('config.json');
    if (!response.ok) {
        throw new Error('无法加载配置文件');
    }
    config = await response.json();
}

loadConfig();

async function checkNovelTitle(novelTitle, number) {
    const response = await fetch(`${config.apiBaseUrl}checknovel?novelTitle=${encodeURIComponent(novelTitle)}&number=${number}`);
    const data = await response.json();
    return data.exists;
}

async function checkCommentExists(comment) {
    const response = await fetch(`${config.apiBaseUrl}checkcomment`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(comment)
    });
    const data = await response.json();
    return data.exists;
}

function validateInput() {
    const wxNickName = document.getElementById('wxNickName').value.trim();
    const novelTitle = document.getElementById('novelTitle').value.trim();
    const number = document.getElementById('number').value.trim();
    const commentText = document.getElementById('commentText').value.trim();

    if (!wxNickName || !novelTitle || !number || !commentText) {
        alert('请填写所有必填项');
        return false;
    }

    if (novelTitle.includes('《') || novelTitle.includes('》')) {
        document.getElementById('novelTitleError').textContent = '小说名称不能包含书名号';
        return false;
    }

    if (commentText.length < 50) {
        alert('评论内容至少需要50个字');
        return false;
    }

    return true;
}

// 页面加载时获取配置
document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('config.json');
        const config = await response.json();
        document.getElementById('number').value = config.number;
    } catch (error) {
        console.error('加载配置文件失败:', error);
    }

});

// 更新字数统计
function updateCharCount() {
    const commentText = document.getElementById('commentText').value;
    const charCount = commentText.length;
    document.getElementById('charCount').textContent = `${charCount}/50`;

    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = charCount < 50;
}

async function submitComment() {
    if (!validateInput()) return;

    const wxNickName = document.getElementById('wxNickName').value.trim();
    const novelTitle = document.getElementById('novelTitle').value.trim();
    const number = parseInt(document.getElementById('number').value.trim(), 10);
    const commentText = document.getElementById('commentText').value.trim();

    // 检查小说名称是否存在
    const titleExists = await checkNovelTitle("《" + novelTitle + "》", parseInt(number, 10));
    if (!titleExists) {
        document.getElementById('novelTitleError').textContent = '小说名称不存在';
        return;
    }

    // 检查评论是否重复
    const comment = {
        wxNickName: wxNickName,
        novelTitle: `《${novelTitle}》`,
        number: parseInt(number, 10),
        commentText: commentText
    };

    const commentExists = await checkCommentExists(comment);
    if (commentExists) {
        alert('该评论已存在');
        return;
    }

    // 提交评论
    try {
        const response = await fetch(`${config.apiBaseUrl}addcomments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(comment)
        });

        if (response.ok) {
            alert('评论提交成功');
            window.location.href = 'index.html';
        } else {
            alert('评论提交失败');
        }
    } catch (error) {
        alert('提交评论时发生错误');
        console.error(error);
    }
}

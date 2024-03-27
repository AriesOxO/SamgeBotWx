let currentPage = 1;
let pageSize = 10;

function fetchComments(interfaceName, page, pageSize) {
    const wxNickName = document.getElementById('wxNickName').value;
    const novelTitle = document.getElementById('novelTitle').value;
    const numberOfRaces = document.getElementById('numberOfRaces').value;
    let url = `http://127.0.0.1:8888/api/${interfaceName}?page=${page}&pageSize=${pageSize}`;

    if (wxNickName.trim() !== '') {
        url += `&wxNickName=${wxNickName}`;
    }
    if (novelTitle.trim() !== '') {
        url += `&novelTitle=${novelTitle}`;
    }
    if (numberOfRaces.trim() !== '') {
        url += `&number=${numberOfRaces}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayComments(data);
        })
        .catch(error => {
            console.error('Error fetching comments:', error);
        });
}

function displayComments(comments) {
    const tableBody = document.getElementById('commentsBody');
    let totalCount = comments.total;
    let pageSize = comments.pageSize;
    let totalPages = Math.ceil(totalCount / pageSize);

    tableBody.innerHTML = '';
    document.getElementById('totalPages').textContent = totalPages;

    comments.data.forEach(comment => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${comment.WxNickName}</td>
            <td>${comment.Number}</td>
            <td>${comment.NovelTitle}</td>
            <td>${comment.CommentText}</td>
            <td>${comment.CreateTime}</td>
        `;
        tableBody.appendChild(row);
    });
}


function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        fetchComments('comments', currentPage, pageSize);
        document.getElementById('currentPage').textContent = currentPage;
    }
}

function nextPage() {
    // 这里需要根据实际情况判断是否还有下一页
    currentPage++;
    fetchComments('comments', currentPage, pageSize);
    document.getElementById('currentPage').textContent = currentPage;
}

function changePageSize() {
    pageSize = parseInt(document.getElementById('pageSize').value);
    currentPage = 1; // 切换每页大小后，回到第一页
    fetchComments('comments', currentPage, pageSize);
    document.getElementById('currentPage').textContent = currentPage;
}
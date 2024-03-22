function fetchComments() {
    const wxNickName = document.getElementById('wxNickName').value;
    const novelTitle = document.getElementById('novelTitle').value;
    const numberOfRaces = document.getElementById('numberOfRaces').value;
    let url = 'http://127.0.0.1:8888/api/comments?';

    if (wxNickName.trim() !== '') {
        url += `&wxNickName=${wxNickName}`;
    }
    if (novelTitle.trim() !== '') {
        url += `&novelTitle=${novelTitle}`;
    }
    if (numberOfRaces.trim() !== '') {
        url += `&number=${numberOfRaces}`;
    }

// 去掉第一个参数的 &
    url = url.replace('?&', '?');

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
    tableBody.innerHTML = '';

    comments.forEach(comment => {
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

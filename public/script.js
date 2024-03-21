function fetchComments() {
    const wxNickName = document.getElementById('wxNickName').value;
    const novelTitle = document.getElementById('novelTitle').value;

    const url = `http://127.0.0.1:8888/api/comments?wxNickName=${wxNickName}&novelTitle=${novelTitle}`;

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
            <td>${comment.ID}</td>
            <td>${comment.WxNickName}</td>
            <td>${comment.Number}</td>
            <td>${comment.NovelTitle}</td>
            <td>${comment.CommentText}</td>
            <td>${comment.CreateTime}</td>
            <td>${comment.UpdateTime}</td>
        `;
        tableBody.appendChild(row);
    });
}

let currentPage = 1;
let pageSize = 10;

function fetchComments(interfaceName, page, pageSize) {
    const wxNickName = document.getElementById('wxNickName').value;
    const novelTitle = document.getElementById('novelTitle').value;
    const numberOfRaces = document.getElementById('numberOfRaces').value;
    let url = `http://114.55.235.157:8888/api/${interfaceName}?page=${page}&pageSize=${pageSize}`;

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
    const totalCount = comments.total;
    const pageSize = comments.pageSize;
    const totalPages = Math.ceil(totalCount / pageSize);
    tableBody.innerHTML = '';
    document.getElementById('totalPages').textContent = `共${totalPages}页`;
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
    setPagination()
}

function setPagination(){
  const page = document.getElementById('currentPage').textContent;
  const pageRange = getPageRange(Number(totalPages), Number(page), 5);
  const pageList = document.getElementById('page-btns');
  pageList.innerHTML = ''
  pageRange.forEach(item=>{
    const span = document.createElement('span');
    span.textContent = item;
    span.className = (item == page ? 'page-active' : '');
    span.setAttribute('data-item', item);
    // 绑定点击事件
    span.onclick = function() {
      if(currentPage == this.getAttribute('data-item')) return
      fetchComments('comments', this.getAttribute('data-item'), pageSize);
      currentPage = this.getAttribute('data-item');
      document.getElementById('currentPage').textContent = this.getAttribute('data-item');
    };
    pageList.appendChild(span);
  })
}

function getPageRange(totalPages, currentPage, displayCount) {
  if (displayCount % 2 === 0) {
      displayCount++;
  }
  const halfDisplay = Math.floor(displayCount / 2);
  let startPage = currentPage - halfDisplay;
  let endPage = currentPage + halfDisplay;
  if (startPage < 1) {
      endPage += Math.abs(startPage) + 1;
      startPage = 1;
  }
  if (endPage > totalPages) {
      startPage -= (endPage - totalPages);
      endPage = totalPages;
  }
  if (startPage < 1) {
      startPage = 1;
  }
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
  }
  return pages;
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


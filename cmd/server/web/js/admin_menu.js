// 管理按钮下拉菜单交互
window.addEventListener('DOMContentLoaded', function() {
  var adminBtn = document.getElementById('admin-btn');
  var adminMenu = document.getElementById('admin-menu');
  if (!adminBtn || !adminMenu) return;
  adminBtn.onclick = function(e) {
    e.stopPropagation();
    adminMenu.classList.toggle('hidden');
  };
  document.body.onclick = function(e) {
    if (!e.target.closest('#admin-menu-container')) {
      adminMenu.classList.add('hidden');
    }
  };
}); 
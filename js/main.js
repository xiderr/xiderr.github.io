const perPage = 8; // 全局定义

document.addEventListener('DOMContentLoaded', function() {
  // 初始化 Masonry
  window.masonryInstance = new Masonry('.masonry', {
    itemSelector: '.masonry-item',
    columnWidth: 300,
    gutter: 20
  });

  // 图片懒加载
  const lazyImages = document.querySelectorAll('.masonry-item img');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        observer.unobserve(img);
        img.onload = () => {
          window.masonryInstance.reloadItems();
          window.masonryInstance.layout();
        };
      }
    });
  });
  lazyImages.forEach(img => observer.observe(img));

  lightGallery(document.querySelector('.masonry'), {
    selector: '.masonry-item',
    download: false,
    thumbnail: true
  });   
});

// 标签点击事件
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', function() {
    const selectedTag = this.dataset.tag;
    filterPhotosByTag(selectedTag);
  });
});



function filterPhotosByTag(tag) {
  const filteredPhotos = window.allPhotos.filter(photo => 
    photo.tags.some(t => t === tag)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  // 清空内容并渲染
  const content = document.querySelector('.content');
  content.innerHTML = '<div class="masonry"></div>';
  renderPhotos(filteredPhotos.slice(0, perPage)); // 首頁顯示8張

  // 生成分頁
  if (filteredPhotos.length > perPage) {
    renderPagination(filteredPhotos.length, tag);
  }
}

function renderPagination(total, tag = '') {
  const pages = Math.ceil(total / perPage);
  let html = `
    <div class="pagination">
      <div class="pagination-info">
      <div class="pagination-buttons">
  `;
  
  for (let i = 1; i <= pages; i++) {
    html += `<a class="pagination-btn" onclick="loadPage(${i}, '${tag}')">${i}</a>`;
  }
  
  html += `</div></div>`;
  document.querySelector('.content').innerHTML += html;
}

function loadPage(page, tag) {
  const start = (page - 1) * perPage;
  const photos = window.allPhotos.filter(photo => 
    tag ? photo.tags.includes(tag) : true
  ).slice(start, start + perPage);
  renderPhotos(photos);
}

// main.js
function renderPhotos(photos) {
  const masonry = document.querySelector('.masonry');
  masonry.innerHTML = photos.map(photo => `
    <div class="masonry-item">
      <img src="${photo.path}" alt="${photo.tags.join(', ')}">
    </div>
  `).join('');

  // 强制销毁旧实例
  if (window.lgInstance) {
    window.lgInstance.destroy();
  }

  // 重新初始化lightGallery
  window.lgInstance = lightGallery(masonry, {
    selector: '.masonry-item',
    download: false,
    thumbnail: true,
    actualSize: false,
    fullScreen: true // 启用全屏模式
  });

  // Masonry布局刷新
  setTimeout(() => {
    window.masonryInstance.reloadItems();
    window.masonryInstance.layout();
  }, 100);
}

// main.js
// 移动端折叠逻辑
document.querySelector('.toggle-sidebar').addEventListener('click', function() {
  if (window.innerWidth <= 768) {
    document.querySelector('.sidebar').classList.toggle('expanded');
  }
});

// 窗口大小变化时自动折叠
window.addEventListener('resize', function() {
  if (window.innerWidth > 768) {
    document.querySelector('.sidebar').classList.remove('expanded');
  }
});

// 初始化分页
function initPagination() {
  const total = window.allPhotos.length;
  if (total > 8) {
    renderPagination(total);
  }
}   

// 在lightGallery初始化后添加错误处理
document.querySelectorAll('.masonry-item img').forEach(img => {
  img.onerror = () => {
    img.src = '/placeholder.jpg'; // 备用图片路径
  };
});
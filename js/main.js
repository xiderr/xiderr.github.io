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

  // 初始化分页和画廊
  initPagination();
  lightGallery(document.querySelector('.masonry'), {
    selector: '.masonry-item img'
  });
});

// 标签点击事件
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', function() {
    const selectedTag = this.dataset.tag;
    filterPhotosByTag(selectedTag);
  });
});

// 唯一的分页和过滤逻辑
function filterPhotosByTag(tag) {
  const filteredPhotos = window.allPhotos.filter(photo => 
    photo.tags.includes(tag)
  ).sort((a, b) => new Date(b.date) - new Date(a.date));

  renderPhotos(filteredPhotos.slice(0, 9));
  if (filteredPhotos.length > 9) {
    renderPagination(filteredPhotos.length, tag);
  }
}

function renderPagination(total, tag = '') {
  const pages = Math.ceil(total / 9);
  let html = '<div class="pagination">';
  for (let i = 1; i <= pages; i++) {
    html += `<a class="pagination-btn ${i===1?'active':''}" onclick="loadPage(${i}, '${tag}')">${i}</a>`;
  }
  html += '</div>';
  document.querySelector('.content').innerHTML += html;
}

function loadPage(page, tag) {
  const start = (page - 1) * 9;
  const photos = window.allPhotos.filter(photo => 
    tag ? photo.tags.includes(tag) : true
  ).slice(start, start + 9);
  renderPhotos(photos);
}

function renderPhotos(photos) {
  const masonry = document.querySelector('.masonry');
  masonry.innerHTML = photos.map(photo => `
    <div class="masonry-item">
      <img src="${photo.path}" alt="${photo.tags.join(', ')}">
    </div>
  `).join('');
  window.masonryInstance.reloadItems();
  window.masonryInstance.layout();
}

// 初始化分页
function initPagination() {
  const total = window.allPhotos.length;
  if (total > 9) {
    renderPagination(total);
  }
}
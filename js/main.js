// 在 main.js 顶部添加以下代码
function initImageClick() {
  document.body.addEventListener('click', function(e) {
    const img = e.target.closest('.masonry-item img');
    if (!img) return;

    // 创建全屏容器
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    
    // 加载高清图
    const fullImg = new Image();
    fullImg.src = img.src;
    fullImg.className = 'fullscreen-img';
    
    // 添加加载状态处理
    fullImg.onload = () => {
      overlay.classList.add('loaded'); // 新增此行
      overlay.appendChild(fullImg);
      document.body.appendChild(overlay);
    };

    // 点击关闭
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  });
}

document.addEventListener('DOMContentLoaded', initImageClick);

const perPage = 8;
let currentTag = '';
let currentPage = 1;

function initMasonry() {
  imagesLoaded('.masonry', () => {
    window.masonryInstance = new Masonry('.masonry', {
      itemSelector: '.masonry-item',
      columnWidth: 300,
      gutter: 20
    });
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const masonryElem = document.querySelector('.masonry');
  
  // 使用 imagesLoaded 确保图片加载完成
  imagesLoaded(masonryElem, () => {
    window.masonryInstance = new Masonry(masonryElem, {
      itemSelector: '.masonry-item',
      columnWidth: 300,
      gutter: 20,
      transitionDuration: 0 // 禁用过渡动画防止闪烁
    });
  });

  initTags();
});

function filterPhotosByTag(tag) {
  if(window.masonryInstance) {
    window.masonryInstance.destroy();
    window.masonryInstance = null;
  }
  const filteredPhotos = window.allPhotos.filter(photo => 
    photo.tags.some(t => t === tag)
  );

  // 清空内容并创建新容器
  const content = document.querySelector('.content');
  content.innerHTML = '<div class="masonry"></div>';

  // 销毁旧实例
  if (window.masonryInstance) window.masonryInstance.destroy();

  // 新增分页渲染
  renderPhotos(filteredPhotos.slice(0, perPage));
  renderPagination(filteredPhotos.length, tag); // 新增此行

  setTimeout(() => {
    imagesLoaded('.masonry', () => {
      window.masonryInstance = new Masonry('.masonry', {
        itemSelector: '.masonry-item',
        columnWidth: 300,
        gutter: 20
      });
      masonryInstance.layout();
    });
  }, 300);
}

function renderPhotos(photos) {
  const masonry = document.querySelector('.masonry');
  masonry.innerHTML = photos.map(photo => `
    <div class="masonry-item">
      <img data-src="${photo.path}" 
           alt="${photo.tags.join(', ')}" 
           class="lazy-load">
    </div>
  `).join('');

  // 懒加载
  const lazyImages = document.querySelectorAll('.lazy-load');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.onload = () => {
          if (window.masonryInstance) {
            window.masonryInstance.reloadItems();
            window.masonryInstance.layout();
          }
        };
        observer.unobserve(img);
      }
    });
  }, { rootMargin: '200px' });

  lazyImages.forEach(img => observer.observe(img));
}

// 初始加载
document.addEventListener('DOMContentLoaded', () => {
  renderPhotos(window.allPhotos.slice(0, perPage));
  renderPagination(window.allPhotos.length);
  initMasonry();
});


function updatePagination(total) {
  const pages = Math.ceil(total / perPage);
  const pagination = document.querySelector('.pagination');
  if (!pagination) {
    console.error('Pagination container not found');
    return;
  }
  pagination.innerHTML = Array.from({length: pages}, (_, i) => `
    <a class="pagination-btn ${i+1 === currentPage ? 'active' : ''}" 
       onclick="loadPage(${i+1})">${i+1}</a>
  `).join('');
}


function renderPagination(total, tag = '') {
  const pages = Math.ceil(total / perPage);
  
  // 清空旧分页内容
  const oldPagination = document.querySelector('.pagination');
  if (oldPagination) oldPagination.remove();

  // 生成新分页
  const html = `
    <div class="pagination">
      <div class="pagination-buttons">
        ${Array.from({length: pages}, (_, i) => `
          <a class="pagination-btn" 
             onclick="loadPage(${i+1}, '${encodeURIComponent(tag)}')">
            ${i+1}
          </a>
        `).join('')}
      </div>
    </div>
  `;
  
  // 插入到内容区底部
  document.querySelector('.content').insertAdjacentHTML('beforeend', html);
}

function loadPage(page, tag) {
  
  document.querySelectorAll('.tag').forEach(t => {
    if (t.dataset.tag === tag) t.classList.add('active');
    else t.classList.remove('active');
  });

  const start = (page - 1) * perPage;
  const photos = window.allPhotos.filter(photo => 
    tag ? photo.tags.includes(decodeURIComponent(tag)) : true
  ).slice(start, start + perPage);
  renderPhotos(photos);
}


function initPagination() {
  const total = window.allPhotos.length;
  if (total > 8) {
    renderPagination(total);
  }
}

// XIDERR点击刷新功能
document.querySelector('.mobile-header span').addEventListener('click', function() {
  window.location.href = '/'; // 返回首页
  if(window.location.pathname === '/') {
    // 随机打乱图片
    const shuffled = window.allPhotos.sort(() => Math.random() - 0.5);
    renderPhotos(shuffled.slice(0, perPage));
  }
});

// 图片点击查看原图功能
document.addEventListener('click', function(e) {
  const img = e.target.closest('.masonry-item img');
  if (img) {
    const overlay = document.createElement('div');
    overlay.className = 'fullscreen-overlay';
    
    const fullImg = new Image();
    fullImg.src = img.src;
    fullImg.className = 'fullscreen-img';
    
    overlay.appendChild(fullImg);
    document.body.appendChild(overlay);

    // 点击关闭
    overlay.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
  }
});

// main.js 修改折叠逻辑
document.querySelector('.fold-btn').addEventListener('click', function() {
  const content = document.querySelector('.foldable-content');
  this.classList.toggle('active');
  content.classList.toggle('active');
  
  // 手动触发Masonry布局更新
  setTimeout(() => {
    window.masonryInstance.layout();
  }, 300);
});

// main.js 新增函数
function initTags() {
  const tagsContainer = document.querySelector('.tags');
  if (!window.allPhotos || !Array.isArray(window.allPhotos)) {
    console.error('window.allPhotos 数据未正确加载');
    tagsContainer.innerHTML = '<div>数据加载失败</div>';
    return;
  }

  const allTags = [...new Set(window.allPhotos.flatMap(photo => photo.tags))];
  
  tagsContainer.innerHTML = allTags.map(tag => `
    <a href="javascript:void(0)" 
       class="tag" 
       data-tag="${tag}">
      ${tag}
    </a>
  `).join('');
}

document.querySelector('.tags').addEventListener('click', e => {
  const tag = e.target.closest('.tag');
  if (!tag?.dataset?.tag) return;

  // 移除所有标签激活状态
  document.querySelectorAll('.tag.active').forEach(t => t.classList.remove('active'));
  
  // 设置当前标签激活
  tag.classList.add('active');

  // 执行筛选
  currentTag = tag.dataset.tag;
  currentPage = 1;
  const filtered = window.allPhotos.filter(p => p.tags.includes(currentTag));
  renderPhotos(filtered.slice(0, perPage));
  updatePagination(filtered.length);
});

window.loadPage = page => {
  currentPage = page;
  const start = (page - 1) * perPage;
  const data = currentTag 
    ? window.allPhotos.filter(p => p.tags.includes(currentTag))
    : window.allPhotos;
  
  renderPhotos(data.slice(start, start + perPage));
  updatePagination(data.length);
  window.scrollTo(0, 0);
}



// 在main.js添加验证
document.addEventListener('DOMContentLoaded', () => {
  if (!window.allPhotos || !Array.isArray(window.allPhotos)) {
    console.error('window.allPhotos 数据未正确加载');
    return;
  }
  const expectedTags = [...new Set(window.allPhotos.flatMap(p => p.tags))];
  console.assert(
    document.querySelectorAll('.tag').length === expectedTags.length,
    '标签数量不匹配'
  );
});

// 测试移动端折叠功能
function testMobileMenu() {
  const btn = document.querySelector('.fold-btn');
  btn.click();
  console.assert(
    document.querySelector('.foldable-content').classList.contains('active'),
    '折叠功能异常'
  );
}

// main.js
document.querySelector('.sidebar').addEventListener('click', function(e) {
  const tag = e.target.closest('.tag');
  if (!tag) return;

  console.log('标签被点击:', tag.dataset.tag); // 调试输出
  filterPhotosByTag(tag.dataset.tag);
  
  // 更新激活状态
  document.querySelectorAll('.tag').forEach(t => 
    t.classList.remove('active')
  );
  tag.classList.add('active');
});


document.addEventListener('DOMContentLoaded', initImageClick);
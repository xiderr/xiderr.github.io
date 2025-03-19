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
        // 图片加载完成后强制刷新布局
        img.onload = () => {
          window.masonryInstance.reloadItems();
          window.masonryInstance.layout();
        };
      }
    });
  });
  lazyImages.forEach(img => observer.observe(img));
});


document.addEventListener('DOMContentLoaded', () => {
  // 标签点击事件
  document.querySelectorAll('.tag').forEach(tag => {
    tag.addEventListener('click', function() {
      const selectedTag = this.dataset.tag;
      filterPhotos(selectedTag);
    });
  });

  // 图片筛选函数
  function filterPhotos(tag) {
    const masonry = document.querySelector('.masonry');
    masonry.innerHTML = ''; // 清空当前内容

    window.allPhotos
      .filter(photo => photo.tags.includes(tag))
      .slice(0, 9) // 显示前9张
      .forEach(photo => {
        masonry.innerHTML += `
          <div class="masonry-item">
            <img src="${photo.path}" alt="${photo.tags.join(', ')}">
          </div>
        `;
      });

    // 重新初始化lightGallery
    lightGallery(masonry, { selector: '.masonry-item img' });
  }
});


// 点击标签事件
document.querySelectorAll('.tag').forEach(tag => {
  tag.addEventListener('click', function() {
    const selectedTag = this.dataset.tag;
    filterPhotosByTag(selectedTag);
  });
});

function filterPhotosByTag(tag) {
  // 1. 请求该标签下所有图片（按时间倒序）
  fetch(`/api/photos?tag=${tag}`)
    .then(res => res.json())
    .then(photos => {
      // 2. 渲染图片
      renderPhotos(photos.slice(0, 9)); 
      // 3. 分页逻辑（超过9张显示页码）
      if (photos.length > 9) {
        renderPagination(photos.length);
      }
    });
}

// 在 Hexo 生成时全局注入标签数据
hexo.extend.filter.register('template_locals', function(locals) {
  const photos = hexo.locals.get('data').photos;
  const tags = new Set();
  photos.forEach(photo => photo.tags.forEach(tag => tags.add(tag)));
  locals.allTags = Array.from(tags);
  return locals;
});

// 在 initTagCloud 函数后添加
function initSearch() {
  const searchBox = document.createElement('input');
  searchBox.placeholder = '搜索标签...';
  searchBox.className = 'tag-search';
  document.querySelector('.tag-cloud').prepend(searchBox);

  searchBox.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    document.querySelectorAll('.tag-item').forEach(tag => {
      const tagName = tag.dataset.tag.toLowerCase();
      tag.style.display = tagName.includes(query) ? 'inline-block' : 'none';
    });
  });
}

// 在初始化时调用
initSearch();


// 侧边栏移动端折叠
document.querySelector('.sidebar').addEventListener('click', function(e) {
  if (window.innerWidth <= 768 && e.target === this) {
    this.classList.toggle('active');
  }
});



// 提取文件名中的标签（假设文件名格式为：标签1-标签2-...-name.jpg）
function extractTagsFromImages() {
  const tags = new Set();
  document.querySelectorAll('.masonry-item img').forEach(img => {
    const fileName = img.src.split('/').pop().split('.')[0];
    // 排除纯数字的片段（如作品编号）
    const fileTags = fileName.split('-').filter(tag => isNaN(tag));
    fileTags.forEach(tag => tags.add(tag));
  });
  return Array.from(tags);
}

// 动态生成标签
function generateTagCloud() {
  const tags = extractTagsFromImages();
  const tagCloud = document.querySelector('.tag-cloud');
  tagCloud.innerHTML = tags.map(tag => `
    <a href="javascript:void(0)" class="tag" data-tag="${tag}">${tag}</a>
  `).join('');
}



function renderPagination(total) {
  const pages = Math.ceil(total / 9);
  let html = '<div class="pagination">';
  for (let i = 1; i <= pages; i++) {
    html += `<a href="?page=${i}">${i}</a>`;
  }
  html += '</div>';
  document.querySelector('.content').innerHTML += html;
}

// main.js
function filterPhotosByTag(tag) {
  const filteredPhotos = window.allPhotos.filter(photo => 
    photo.tags.includes(tag)
  ).sort((a, b) => new Date(b.date) - new Date(a.date)); // 按时间倒序

  // 渲染前9张
  renderPhotos(filteredPhotos.slice(0, 9));

  // 分页逻辑
  if (filteredPhotos.length > 9) {
    renderPagination(filteredPhotos.length, tag);
  }
}

function renderPagination(total, tag) {
  const pages = Math.ceil(total / 9);
  let html = '<div class="pagination">';
  for (let i = 1; i <= pages; i++) {
    html += `<a href="javascript:void(0)" onclick="loadPage(${i}, '${tag}')">${i}</a>`;
  }
  html += '</div>';
  document.querySelector('.content').innerHTML += html;
}

function loadPage(page, tag) {
  const start = (page - 1) * 9;
  const photos = allPhotos.filter(photo => 
    tag ? photo.tags.includes(tag) : true
  ).slice(start, start + 9);
  renderPhotos(photos);
}


// main.js
const allPhotos = JSON.parse('<%- JSON.stringify(site.data.photos) %>');
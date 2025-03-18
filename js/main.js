document.addEventListener('DOMContentLoaded', function() {
  new Masonry('.masonry', {
    itemSelector: '.masonry-item',
    columnWidth: 300,
    gutter: 20
  });
});

// 在 Masonry 初始化后添加
document.addEventListener('DOMContentLoaded', function() {
  const lazyImages = document.querySelectorAll('.masonry-item img');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src; // 从 data-src 加载真实图片
        observer.unobserve(img);
      }
    });
  });

  lazyImages.forEach(img => observer.observe(img));
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
        // 图片加载完成后刷新布局
        img.onload = () => {
          window.masonryInstance.layout();
        };
      }
    });
  });
  lazyImages.forEach(img => observer.observe(img));
});
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
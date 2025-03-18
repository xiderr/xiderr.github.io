document.addEventListener('DOMContentLoaded', function() {
  new Masonry('.masonry', {
    itemSelector: '.masonry-item',
    columnWidth: 300,
    gutter: 20
  });
});
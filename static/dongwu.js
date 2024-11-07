// 防恶意反代
const allowedDomains = ['localhost', 'www.damizai.cn', 'hexo.200038.xyz', 'blog.200038.xyz', 'fastly.hexo.200038.xyz'];

if (!allowedDomains.includes(document.domain)) {
  Snackbar.show({
    text: decodeURI('您现在处于恶意镜像站中,即将跳转回源站!'),
    pos: 'top-center',
    actionText: '确定',
    duration: 5000,
    onActionClick: () => window.location.href = 'https://www.damizai.cn'
  });

  setTimeout(() => window.location.href = 'https://www.damizai.cn', 5000);
}


// 底部栏小动物
function initFooterAnimal() {
  const footerBar = document.querySelector('#footer-bar');
  if (!footerBar) return console.error('找不到指定元素');

  const footerAnimal = document.createElement('div');
  footerAnimal.id = 'footer-animal';
  footerAnimal.innerHTML = `
      <img class="animal entered loaded"
          src="https://cdn.jsdelivr.net/gh/niceao/img/2024/10/25/734866.webp"
          alt="动物" />
  `;
  
  footerBar.insertAdjacentElement('beforebegin', footerAnimal);

  const style = document.createElement('style');
  style.textContent = `
      #footer-animal {
          position: relative;
      }
      #footer-animal::before {
          content: '';
          position: absolute;
          bottom: 0;
          width: 100%;
          height: 36px;
          background: url(https://cdn.jsdelivr.net/gh/niceao/img/2024/10/19/976313.webp) repeat center / auto 100%;
          box-shadow: 0 4px 7px rgba(0,0,0,.15);
      }
      .animal {
          position: relative;
          max-width: min(974px, 100vw);
          margin: 0 auto;
          display: block;
      }
      #footer-bar {
          margin-top: 0 !important;
      }
      @media screen and (max-width: 1023px) {
          #footer-animal::before {
              height: 4vw;
          }
      }
      [data-theme=dark] #footer-animal {
          filter: brightness(.8);
      }
  `;
  document.head.appendChild(style);
}

document.addEventListener('DOMContentLoaded', initFooterAnimal);
document.addEventListener('pjax:success', initFooterAnimal);
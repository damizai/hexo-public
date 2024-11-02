window.IP_CONFIG = {
	API_KEY: 'qx9sB0WG5yYlZYuNZubjDm3w9m', // API密钥 申请地址：https://api.76.al/
	BLOG_LOCATION: {
		lng: 108.941867, // 经度
		lat: 34.23852100000001 // 纬度
	},
	SELECTORS: {
		CARD_INFO: '.card-widget.card-info', // 插入来访者卡片信息的节点 下方插入
		WELCOME_INFO: '#welcome-info' // IP和欢迎信息节点
	},
	TEMPLATES: {
		CARD_HTML: `
            <div class="item-headline">
                <i class="fa-solid fa-user-large" style="font-size: 18px;color: red;"></i>
                <span>欢迎来访者！</span>
            </div>
            <div class="item-content">
                👋🏻 Hi，我是东方月初，欢迎来到我的小站😀！<br>
                ❓ 如有问题欢迎评论区交流！<br>
                😫 页面异常？尝试<kbd>Ctrl</kbd>+<kbd>F5</kbd><br>
                📧 如需联系我：<a href="mailto:jinxcose@gmail.com"><b>发送邮件🚀</b></a>
            </div>
            <div id="welcome-info"></div>`
	}
};

const insertAnnouncementComponent = () => {
	// 只在首页插入
	if (!isHomePage()) return;

	const cardInfo = document.querySelector(IP_CONFIG.SELECTORS.CARD_INFO);
	if (!cardInfo) return;

	const ipInfoElement = createIpInfoElement();
	cardInfo.parentNode.insertBefore(ipInfoElement, cardInfo.nextSibling);
	fetchIpInfo();
};

const isHomePage = () => ['/', '/index.html'].includes(window.location.pathname);
const createIpInfoElement = () => {
	const element = document.createElement('div');
	element.classList.add("card-widget", "card-welcome");
	element.innerHTML = IP_CONFIG.TEMPLATES.CARD_HTML;
	return element;
};
const getWelcomeInfoElement = () => document.querySelector(IP_CONFIG.SELECTORS.WELCOME_INFO);

const fetchIpData = async () => {
	const response = await fetch(`https://api.76.al/api/ip/query?key=${encodeURIComponent(IP_CONFIG.API_KEY)}`);
	if (!response.ok) throw new Error('网络响应不正常');
	return await response.json();
};

const showWelcome = ({
	data,
	ip
}) => {
	if (!data) return showErrorMessage();

	const {
		lng,
		lat,
		country,
		prov,
		city
	} = data;
	const welcomeInfo = getWelcomeInfoElement();
	if (!welcomeInfo) return;

	const dist = calculateDistance(lng, lat);
	const ipDisplay = formatIpDisplay(ip);
	const pos = formatLocation(country, prov, city);

	welcomeInfo.style.display = 'block';
	welcomeInfo.style.height = 'auto';
	welcomeInfo.innerHTML = generateWelcomeMessage(pos, dist, ipDisplay, country, prov, city);
};

const calculateDistance = (lng, lat) => {
	const R = 6371; // 地球半径(km)
	const rad = Math.PI / 180;
	const dLat = (lat - IP_CONFIG.BLOG_LOCATION.lat) * rad;
	const dLon = (lng - IP_CONFIG.BLOG_LOCATION.lng) * rad;
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
		Math.cos(IP_CONFIG.BLOG_LOCATION.lat * rad) * Math.cos(lat * rad) *
		Math.sin(dLon / 2) * Math.sin(dLon / 2);

	return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};
const formatIpDisplay = (ip) => ip.includes(":") ? "<br>好复杂，咱看不懂~(ipv6)" : ip;
const formatLocation = (country, prov, city) => {
	return country ? (country === "中国" ? `${prov} ${city}` : country) : '神秘地区';
};

const generateWelcomeMessage = (pos, dist, ipDisplay, country, prov, city) => `
    欢迎来自 <b>${pos}</b> 的小友💖<br>
    你当前距博主约 <b>${dist}</b> 公里！<br>
    你的IP地址：<b class="ip-address">${ipDisplay}</b><br>
    ${getTimeGreeting()}<br>
    Tip：<b>${getGreeting(country, prov, city)}🍂</b>
`;

const addStyles = () => {
	const style = document.createElement('style');
	style.textContent = `
        .item-content {
            margin: 5px 0 10px 0;
        }
        #welcome-info {
            user-select: none;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 212px;
            padding: 10px;
            border-radius: 12px;
            background-color: var(--anzhiyu-background);
            outline: 1px solid var(--anzhiyu-card-border);
        }
        .loading-spinner {
            width: 50px;
            height: 50px;
            border: 3px solid rgba(0, 0, 0, 0.1);
            border-radius: 50%;
            border-top: 3px solid var(--anzhiyu-main);
            animation: spin 1s linear infinite;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .ip-address {
            filter: blur(5px);
            transition: filter 0.3s ease;
        }
        .ip-address:hover {
            filter: blur(0);
        }
        .error-message {
            color: #ff6565;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .error-message p,
        .permission-dialog p {
            margin: 0;
        }
        .error-icon {
            font-size: 3rem;
        }
        #retry-button {
            margin: 0 5px;
            color: var(--anzhiyu-main);
            transition: transform 0.3s ease;
        }
        #retry-button:hover {
            transform: rotate(180deg);
        }
        .permission-dialog {
            text-align: center;
        }
        .permission-dialog button {
            margin: 10px 5px;
            padding: 5px 10px;
            border: none;
            border-radius: 5px;
            background-color: var(--anzhiyu-main);
            color: white;
            transition: opacity 0.3s ease;
        }
        .permission-dialog button:hover {
            opacity: 0.8;
        }
    `;
	document.head.appendChild(style);
};

// 位置权限相关函数
const checkLocationPermission = () => localStorage.getItem('locationPermission') === 'granted';
const saveLocationPermission = (permission) => {
	localStorage.setItem('locationPermission', permission);
};
const showLocationPermissionDialog = () => {
	const welcomeInfoElement = document.getElementById("welcome-info");
	welcomeInfoElement.innerHTML = `
        <div class="permission-dialog">
            <div class="error-icon">❓</div>
            <p>是否允许访问您的位置信息？</p>
            <button data-action="allow">允许</button>
            <button data-action="deny">拒绝</button>
        </div>
    `;

	welcomeInfoElement.addEventListener('click', (e) => {
		if (e.target.tagName === 'BUTTON') {
			const action = e.target.dataset.action;
			const permission = action === 'allow' ? 'granted' : 'denied';
			handleLocationPermission(permission);
		}
	});
};
const handleLocationPermission = (permission) => {
	saveLocationPermission(permission);
	if (permission === 'granted') {
		showLoadingSpinner();
		fetchIpInfo();
	} else {
		showErrorMessage('您已拒绝访问位置信息');
	}
};

const showLoadingSpinner = () => {
	const welcomeInfoElement = document.getElementById("welcome-info"); 
	welcomeInfoElement.innerHTML = '<div class="loading-spinner"></div>';
};

const IP_CACHE_KEY = 'ip_info_cache';
const IP_CACHE_DURATION = 1000 * 60 * 60; // 1小时缓存
const getIpInfoFromCache = () => {
	const cached = localStorage.getItem(IP_CACHE_KEY);
	if (!cached) return null;

	const {
		data,
		timestamp
	} = JSON.parse(cached);
	if (Date.now() - timestamp > IP_CACHE_DURATION) {
		localStorage.removeItem(IP_CACHE_KEY);
		return null;
	}
	return data;
};
const setIpInfoCache = (data) => {
	localStorage.setItem(IP_CACHE_KEY, JSON.stringify({
		data,
		timestamp: Date.now()
	}));
};

const fetchIpInfo = async () => {
	if (!checkLocationPermission()) {
		showLocationPermissionDialog();
		return;
	}

	showLoadingSpinner();

	// 检查缓存
	const cachedData = getIpInfoFromCache();
	if (cachedData) {
		showWelcome(cachedData);
		return;
	}

	try {
		const data = await fetchIpData();
		setIpInfoCache(data);
		showWelcome(data);
	} catch (error) {
		console.error('获取IP信息失败:', error);
		showErrorMessage();
	}
};

const greetings = {
	"中国": {
		"北京市": "北——京——欢迎你~~~",
		"天津市": "讲段相声吧",
		"河北省": "山势巍巍成壁垒，天下雄关铁马金戈由此向，无限江山",
		"山西省": "展开坐具长三尺，已占山河五百余",
		"内蒙古自治区": "天苍苍，野茫茫，风吹草低见牛羊",
		"辽宁省": "我想吃烤鸡架！",
		"吉林省": "状元阁就是东北烧烤之王",
		"黑龙江省": "很喜欢哈尔滨大剧院",
		"上海市": "众所周知，中国只有两个城市",
		"江苏省": {
			"南京市": "这是我挺想去的城市啦",
			"苏州市": "上有天堂，下有苏杭",
			"其他": "散装是必须要散装的"
		},
		"浙江省": {
			"杭州市": "东风渐绿西湖柳，雁已还人未南归",
			"其他": "望海楼明照曙霞,护江堤白蹋晴沙"
		},
		"河南省": {
			"郑州市": "豫州之域，天地之中",
			"信阳市": "品信阳毛尖，悟人间芳华",
			"南阳市": "臣本布衣，躬耕于南阳此南阳非彼南阳！",
			"驻马店市": "峰峰有奇石，石石挟仙气嵖岈山的花很美哦！",
			"开封市": "刚正不阿包青天",
			"洛阳市": "洛阳牡丹甲天下",
			"其他": "可否带我品尝河南烩面啦？"
		},
		"安徽省": "蚌埠住了，芜湖起飞",
		"福建省": "井邑白云间，岩城远带山",
		"江西省": "落霞与孤鹜齐飞，秋水共长天一色",
		"山东省": "遥望齐州九点烟，一泓海水杯中泻",
		"湖北省": {
			"黄冈市": "红安将军县！辈出将才！",
			"其他": "来碗热干面~"
		},
		"湖南省": "74751，长沙斯塔克",
		"广东省": {
			"广州市": "看小蛮腰，喝早茶了嘛~",
			"深圳市": "今天你逛商场了嘛~",
			"阳江市": "阳春合水！博主家乡~ 欢迎来玩~",
			"其他": "来两斤福建人~"
		},
		"广西壮族自治区": "桂林山水甲天下",
		"海南省": "朝观日出逐白浪，夕看云起收霞光",
		"四川省": "康康川妹子",
		"贵州省": "茅台，学生，再塞200",
		"云南省": "玉龙飞舞云缠绕，万仞冰川直耸天",
		"西藏自治区": "躺在茫茫草原上，仰望蓝天",
		"陕西省": "来份臊子面加馍",
		"甘肃省": "羌笛何须怨杨柳，春风不度玉门关",
		"青海省": "牛肉干和老酸奶都好好吃",
		"宁夏回族自治区": "大漠孤烟直，长河落日圆",
		"新疆维吾尔自治区": "驼铃古道丝绸路，胡马犹闻唐汉风",
		"台湾省": "我在这头，大陆在那头",
		"香港特别行政区": "永定贼有残留地鬼嚎，迎击光非岁玉",
		"澳门特别行政区": "性感荷官，在线发牌",
		"其他": "带我去你的城市逛逛吧！"
	},
	"美国": "Let us live in peace!",
	"日本": "よろしく、一緒に桜を見ませんか",
	"俄罗斯": "干了这瓶伏特加！",
	"法国": "C'est La Vie",
	"德国": "Die Zeit verging im Fluge.",
	"澳大利亚": "一起去大堡礁吧！",
	"加拿大": "拾起一片枫叶赠予你",
	"其他": "带我去你的国家逛逛吧"
};

const getGreeting = (country, province, city) => {
	const countryGreeting = greetings[country] || greetings["其他"];
	if (typeof countryGreeting === 'string') {
		return countryGreeting;
	}
	const provinceGreeting = countryGreeting[province] || countryGreeting["其他"];
	if (typeof provinceGreeting === 'string') {
		return provinceGreeting;
	}
	return provinceGreeting[city] || provinceGreeting["其他"] || countryGreeting["其他"];
};
const getTimeGreeting = () => {
	const hour = new Date().getHours();
	if (hour < 11) return "早上好🌤️ ，一日之计在于晨";
	if (hour < 13) return "中午好☀️ ，记得午休喔~";
	if (hour < 17) return "下午好🕞 ，饮茶先啦！";
	if (hour < 19) return "即将下班🚶‍♂️，记得按时吃饭~";
	return "晚上好🌙 ，夜生活嗨起来！";
};

const showErrorMessage = (message = '抱歉，无法获取信息') => {
	const welcomeInfoElement = document.getElementById("welcome-info");
	welcomeInfoElement.innerHTML = `
        <div class="error-message">
            <div class="error-icon">😕</div>
            <p>${message}</p>
            <p>请<i id="retry-button" class="fa-solid fa-arrows-rotate"></i>重试或检查网络连接</p>
        </div>
    `;

	document.getElementById('retry-button').addEventListener('click', fetchIpInfo);
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
	addStyles();
	insertAnnouncementComponent();
	document.addEventListener('pjax:complete', insertAnnouncementComponent);
});



// 防恶意反代
const allowedDomains = ['localhost', 'hexo.200038.xyz', 'blog.200038.xyz', 'fastly.hexo.200038.xyz'];

if (!allowedDomains.includes(document.domain)) {
  Snackbar.show({
    text: decodeURI('您现在处于恶意镜像站中,即将跳转回源站!'),
    pos: 'top-center',
    actionText: '确定',
    duration: 5000,
    onActionClick: () => window.location.href = 'https://hexo.200038.xyz'
  });

  setTimeout(() => window.location.href = 'https://hexo.200038.xyz', 5000);
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
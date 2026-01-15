// 和风天气API配置
const API_CONFIG = {
    host: 'n267cegatv.re.qweatherapi.com',
    key: '0279f324764f45d4bfa0b6db447056a3' // API密钥
};

// API缓存配置
const CACHE_CONFIG = {
    expiryTime: 10 * 60 * 1000, // 缓存10分钟
    cache: new Map()
};

// DOM元素 - 初始化为空对象，在DOM加载完成后填充
let DOM_ELEMENTS = {};

// 初始化DOM元素
function initDOMElements() {
    DOM_ELEMENTS = {
        cityName: document.getElementById('city-name'),
        cityInput: document.getElementById('city-input'),
        searchBtn: document.getElementById('search-btn'),
        locateBtn: document.getElementById('locate-btn'),
        currentTemp: document.getElementById('current-temp'),
        weatherDesc: document.getElementById('weather-desc'),
        currentDate: document.getElementById('current-date'),
        feelsLike: document.getElementById('feels-like'),
        humidity: document.getElementById('humidity'),
        windSpeed: document.getElementById('wind-speed'),
        windDir: document.getElementById('windDir'),
        windScale: document.getElementById('windScale'),
        pressure: document.getElementById('pressure'),
        precip: document.getElementById('precip'),
        dew: document.getElementById('dew'),
        sunrise: document.getElementById('sunrise'),
        sunset: document.getElementById('sunset'),
        visibility: document.getElementById('visibility'),
        clouds: document.getElementById('clouds'),
        updateTime: document.getElementById('update-time'),
        forecastList: document.getElementById('forecast-list'),
        mainIcon: document.getElementById('main-icon'),
        tempChart: document.getElementById('temperture-chart'),
        loadingOverlay: document.getElementById('loading-overlay'),
        lifeIndices: document.getElementById('life-indices'),
        hourlyForecast: document.getElementById('hourly-forecast'),
        weatherWarnings: document.getElementById('weather-warnings'),
        // 天气预警弹窗元素
        warningModal: document.getElementById('warning-modal'),
        closeWarning: document.getElementById('close-warning'),
        warningContent: document.getElementById('warning-content'),
        warningNav: document.getElementById('warning-nav'),
        shareBtn: document.getElementById('share-btn'),
        shareOptions: document.getElementById('share-options'),
        // 分享卡片相关元素（保留，可能后续需要）
        shareCardContainer: document.getElementById('share-card-container'),
        shareCard: document.querySelector('.share-card'),
        shareCityName: document.getElementById('share-city-name'),
        shareDate: document.getElementById('share-date'),
        shareIcon: document.getElementById('share-icon'),
        shareTemp: document.getElementById('share-temp'),
        shareDesc: document.getElementById('share-desc'),
        warmMessage: document.getElementById('warm-message'),
        // 预览界面相关元素（保留，可能后续需要）
        imagePreviewModal: document.getElementById('image-preview-modal'),
        closePreviewBtn: document.getElementById('close-preview'),
        previewCard: document.getElementById('preview-card'),
        previewCityName: document.getElementById('preview-city-name'),
        previewDate: document.getElementById('preview-date'),
        previewIcon: document.getElementById('preview-icon'),
        previewTemp: document.getElementById('preview-temp'),
        previewDesc: document.getElementById('preview-desc'),
        previewWarmMessage: document.getElementById('preview-warm-message'),
        randomBgBtn: document.getElementById('random-bg'),
        randomMessageBtn: document.getElementById('random-message'),
        saveImageBtn: document.getElementById('save-image-btn')
    };
}

// 图表实例
let temperatureChart = null;

// 保存当前预报数据，用于切换趋势类型
let currentForecastData = null;

// 图表标题映射
const CHART_TITLES = {
    temperature: '温度趋势',
    precipitation: '降水趋势',
    humidity: '湿度趋势',
    pressure: '气压趋势',
    visibility: '能见度趋势'
};

// 和风天气官方图标库使用说明：
// 图标类名格式为 qi-图标代码，例如 qi-0 表示晴天
// API返回的icon字段直接作为图标代码使用
const DEFAULT_WEATHER_ICON = 'qi-0'; // 默认图标：晴天

// 天气图标映射 - 从和风天气图标代码映射到Font Awesome图标
// 作为QWeather图标库失效时的备用方案
const WEATHER_ICON_MAPPING = {
    // 晴天
    '100': 'fas fa-sun',
    '150': 'fas fa-moon',
    // 多云
    '101': 'fas fa-cloud-sun',
    '102': 'fas fa-cloud-sun',
    '103': 'fas fa-cloud',
    '104': 'fas fa-cloud',
    '151': 'fas fa-cloud-moon',
    '152': 'fas fa-cloud-moon',
    '153': 'fas fa-cloud',
    // 雨天
    '300': 'fas fa-cloud-showers-heavy',
    '301': 'fas fa-cloud-rain',
    '302': 'fas fa-cloud-bolt',
    '303': 'fas fa-cloud-bolt',
    '304': 'fas fa-cloud-bolt',
    '305': 'fas fa-cloud-rain',
    '306': 'fas fa-cloud-rain',
    '307': 'fas fa-cloud-showers-heavy',
    '308': 'fas fa-cloud-showers-heavy',
    '309': 'fas fa-cloud-drizzle',
    '310': 'fas fa-cloud-drizzle',
    '311': 'fas fa-cloud-drizzle',
    '312': 'fas fa-cloud-drizzle',
    '313': 'fas fa-cloud-rain',
    '314': 'fas fa-cloud-showers-heavy',
    '315': 'fas fa-cloud-rain',
    '316': 'fas fa-cloud-rain',
    '317': 'fas fa-cloud-showers-heavy',
    '318': 'fas fa-cloud-showers-heavy',
    '350': 'fas fa-cloud-drizzle',
    '351': 'fas fa-cloud-drizzle',
    '399': 'fas fa-cloud-rain',
    // 雪天
    '400': 'fas fa-snowflake',
    '401': 'fas fa-snowflake',
    '402': 'fas fa-snowflake',
    '403': 'fas fa-snowflake',
    '404': 'fas fa-cloud-snow',
    '405': 'fas fa-cloud-snow',
    '406': 'fas fa-cloud-snow',
    '407': 'fas fa-snowflake',
    '408': 'fas fa-snowflake',
    '409': 'fas fa-snowflake',
    '410': 'fas fa-snowflake',
    '456': 'fas fa-cloud-snow',
    '457': 'fas fa-cloud-snow',
    '499': 'fas fa-snowflake',
    // 雾/霾
    '500': 'fas fa-smog',
    '501': 'fas fa-smog',
    '502': 'fas fa-smog',
    '503': 'fas fa-wind',
    '504': 'fas fa-wind',
    '507': 'fas fa-wind',
    '508': 'fas fa-wind',
    '509': 'fas fa-smog',
    '510': 'fas fa-smog',
    '511': 'fas fa-smog',
    '512': 'fas fa-smog',
    '513': 'fas fa-smog',
    '514': 'fas fa-smog',
    '515': 'fas fa-smog',
    // 默认
    'default': 'fas fa-cloud'
};

// 搜索历史配置
const SEARCH_HISTORY_CONFIG = {
    maxItems: 10, // 最大历史记录数
    storageKey: 'weather_search_history' // localStorage存储键
};

// 显示加载状态
function showLoading() {
    DOM_ELEMENTS.loadingOverlay.classList.add('active');
}

// 隐藏加载状态
function hideLoading() {
    DOM_ELEMENTS.loadingOverlay.classList.remove('active');
}

// 初始化应用
function initApp() {
    // 初始化DOM元素
    initDOMElements();
    
    // 添加事件监听器
    DOM_ELEMENTS.searchBtn.addEventListener('click', searchCity);
    DOM_ELEMENTS.cityInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchCity();
        }
    });
    DOM_ELEMENTS.locateBtn.addEventListener('click', getCurrentLocation);
    DOM_ELEMENTS.shareBtn.addEventListener('click', toggleShareOptions);
    
    // 添加分享选项点击事件
    document.querySelectorAll('.share-option').forEach(option => {
        option.addEventListener('click', handleShareOption);
    });
    
    // 添加预警弹窗事件监听
    addWarningModalEventListeners();
    
    // 点击页面其他地方关闭分享选项
    document.addEventListener('click', (e) => {
        if (!DOM_ELEMENTS.shareBtn.contains(e.target) && !DOM_ELEMENTS.shareOptions.contains(e.target)) {
            DOM_ELEMENTS.shareOptions.classList.remove('show');
        }
    });
    
    // 添加预览界面事件监听器（保留，可能后续需要）
    DOM_ELEMENTS.closePreviewBtn.addEventListener('click', closePreviewModal);
    DOM_ELEMENTS.randomBgBtn.addEventListener('click', randomBackground);
    DOM_ELEMENTS.randomMessageBtn.addEventListener('click', randomMessage);
    DOM_ELEMENTS.saveImageBtn.addEventListener('click', savePreviewImage);
    
    // 点击模态框背景关闭预览
    DOM_ELEMENTS.imagePreviewModal.addEventListener('click', (e) => {
        if (e.target === DOM_ELEMENTS.imagePreviewModal) {
            closePreviewModal();
        }
    });
    
    // 搜索历史事件监听
    const cityInput = DOM_ELEMENTS.cityInput;
    
    // 输入框聚焦时显示搜索历史
    cityInput.addEventListener('focus', () => {
        // 只有在输入框为空时才显示历史记录
        if (!cityInput.value.trim()) {
            showSearchHistory();
        }
    });
    
    // 输入框输入时清空搜索结果
    cityInput.addEventListener('input', () => {
        clearSearchResults();
        // 如果输入框为空，显示历史记录
        if (!cityInput.value.trim()) {
            showSearchHistory();
        } else {
            // 否则隐藏历史记录和下拉框
            hideSearchDropdown();
        }
    });
    
    // 历史按钮点击事件 - 显示搜索历史
    const historyBtn = document.getElementById('history-btn');
    if (historyBtn) {
        historyBtn.addEventListener('click', () => {
            showSearchHistory();
        });
    }
    
    // 点击页面其他地方时隐藏搜索下拉框
    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.search-container');
        const searchBox = document.querySelector('.search-box');
        const historyBtn = document.getElementById('history-btn');
        const searchBtn = document.getElementById('search-btn');
        if ((!searchBox || !searchBox.contains(e.target)) && e.target !== historyBtn && !historyBtn.contains(e.target) && e.target !== searchBtn && !searchBtn.contains(e.target)) {
            hideSearchDropdown();
        }
    });
    
    // 首次进入网页时自动申请定位
    getCurrentLocation();
}

// 获取搜索历史
function getSearchHistory() {
    try {
        const history = localStorage.getItem(SEARCH_HISTORY_CONFIG.storageKey);
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('获取搜索历史失败:', error);
        return [];
    }
}

// 保存搜索历史
function saveSearchHistory(cityName) {
    try {
        let history = getSearchHistory();
        
        // 移除已存在的相同城市
        history = history.filter(item => item !== cityName);
        
        // 添加到历史记录开头
        history.unshift(cityName);
        
        // 限制历史记录数量
        if (history.length > SEARCH_HISTORY_CONFIG.maxItems) {
            history = history.slice(0, SEARCH_HISTORY_CONFIG.maxItems);
        }
        
        localStorage.setItem(SEARCH_HISTORY_CONFIG.storageKey, JSON.stringify(history));
        
        // 不自动显示搜索历史，避免覆盖搜索结果
        // 只在需要时由其他函数调用showSearchHistory()
    } catch (error) {
        console.error('保存搜索历史失败:', error);
    }
}

// 删除搜索历史项
function removeSearchHistoryItem(cityName) {
    try {
        let history = getSearchHistory();
        history = history.filter(item => item !== cityName);
        localStorage.setItem(SEARCH_HISTORY_CONFIG.storageKey, JSON.stringify(history));
        showSearchHistory();
    } catch (error) {
        console.error('删除搜索历史项失败:', error);
    }
}

// 显示搜索历史
function showSearchHistory() {
    const history = getSearchHistory();
    const historyContainer = document.getElementById('search-history');
    const resultsContainer = document.getElementById('city-selection');
    const dropdownContainer = document.getElementById('search-results');
    
    if (!historyContainer || !resultsContainer || !dropdownContainer) return;
    
    // 清空历史记录
    historyContainer.innerHTML = '';
    
    // 隐藏搜索结果，显示历史记录
    resultsContainer.classList.remove('show');
    
    if (history.length === 0) {
        historyContainer.classList.remove('show');
        dropdownContainer.classList.remove('show');
        return;
    }
    
    // 添加历史记录项
    history.forEach(cityName => {
        const historyItem = document.createElement('div');
        historyItem.className = 'search-history-item';
        
        historyItem.innerHTML = `
            <div class="history-content">
                <div class="history-city">${cityName}</div>
            </div>
            <span class="history-remove" data-city="${cityName}">&times;</span>
        `;
        
        // 点击历史记录项进行搜索
        historyItem.addEventListener('click', (e) => {
            if (e.target.classList.contains('history-remove')) {
                return; // 跳过删除按钮的点击事件
            }
            DOM_ELEMENTS.cityInput.value = cityName;
            searchCity();
            hideSearchDropdown();
        });
        
        // 点击删除按钮删除历史记录
        const removeBtn = historyItem.querySelector('.history-remove');
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // 阻止事件冒泡
            removeSearchHistoryItem(cityName);
        });
        
        historyContainer.appendChild(historyItem);
    });
    
    // 显示历史记录和下拉容器
    historyContainer.classList.add('show');
    dropdownContainer.classList.add('show');
}

// 隐藏搜索历史
function hideSearchHistory() {
    const historyContainer = document.getElementById('search-history');
    if (historyContainer) {
        historyContainer.classList.remove('show');
    }
}

// 显示搜索结果
function showSearchResults() {
    const historyContainer = document.getElementById('search-history');
    const resultsContainer = document.getElementById('city-selection');
    const dropdownContainer = document.getElementById('search-results');
    
    if (!historyContainer || !resultsContainer || !dropdownContainer) return;
    
    // 隐藏历史记录，显示搜索结果
    historyContainer.classList.remove('show');
    resultsContainer.classList.add('show');
    dropdownContainer.classList.add('show');
}

// 隐藏搜索结果
function hideSearchResults() {
    const resultsContainer = document.getElementById('city-selection');
    if (resultsContainer) {
        resultsContainer.classList.remove('show');
    }
}

// 隐藏搜索下拉框
function hideSearchDropdown() {
    const dropdownContainer = document.getElementById('search-results');
    if (dropdownContainer) {
        dropdownContainer.classList.remove('show');
    }
    hideSearchHistory();
    hideSearchResults();
}

// 清空搜索结果
function clearSearchResults() {
    const resultsContainer = document.getElementById('city-selection');
    if (resultsContainer) {
        resultsContainer.innerHTML = '';
    }
}

// 城市搜索
async function searchCity() {
    const cityName = DOM_ELEMENTS.cityInput.value.trim();
    if (!cityName) return;
    
    try {
        showLoading();
        // 先通过城市名称获取城市ID
        const location = await getLocationByCityName(cityName);
        if (location && location.location && location.location.length > 0) {
            console.log('搜索到的城市列表:', location.location);
            // 保存到搜索历史
            saveSearchHistory(cityName);
            // 始终显示城市选择界面，让用户确认选择
            console.log('显示城市选择界面，城市数量:', location.location.length);
            showCitySelection(location.location);
        } else {
            alert('未找到您输入的城市，请检查城市名称是否正确，或尝试其他城市');
        }
    } catch (error) {
        console.error('城市搜索失败:', error);
        let errorMessage = '城市搜索遇到问题，请稍后重试';
        
        // 详细打印错误信息，帮助调试
        console.log('完整错误对象:', error);
        console.log('错误信息:', error.message);
        
        // 直接解析API返回的错误码
        if (error.message.includes('API请求失败')) {
            // 提取API返回的错误信息
            const apiErrorMatch = error.message.match(/API请求失败: (\d+) - (.+)/);
            if (apiErrorMatch) {
                const errorCode = apiErrorMatch[1];
                const errorMsg = apiErrorMatch[2];
                
                console.log('解析到的错误码:', errorCode);
                console.log('解析到的错误信息:', errorMsg);
                
                // 根据不同的错误码给出不同的提示
                switch(errorCode) {
                    case '400':
                        errorMessage = `搜索参数有误，请检查输入的城市名称`;
                        break;
                    case '401':
                    case '403':
                        errorMessage = 'API访问受限，请检查API配置';
                        break;
                    case '404':
                        errorMessage = '未找到您输入的城市，请检查城市名称是否正确';
                        break;
                    case '500':
                    case '502':
                    case '503':
                        errorMessage = '天气服务器暂时不可用，请稍后重试';
                        break;
                    default:
                        errorMessage = `搜索失败: ${errorMsg}`;
                }
            } else {
                // 如果无法解析错误码，直接显示未找到城市
                errorMessage = '未找到您输入的城市，请检查城市名称是否正确';
            }
        } 
        // 处理网络错误
        else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch') || error.message.includes('网络')) {
            errorMessage = '网络连接失败，请检查您的网络设置';
        } 
        // 处理JSON解析错误
        else if (error.message.includes('JSON') || error.message.includes('parse')) {
            errorMessage = '服务器返回数据格式有误，请稍后重试';
        } 
        // 处理其他类型的错误
        else {
            // 尝试从错误信息中提取有用信息
            console.log('其他类型错误，直接使用错误信息');
            errorMessage = `未找到您输入的城市，请检查城市名称是否正确`;
        }
        
        console.log('最终显示的错误信息:', errorMessage);
        alert(errorMessage);
    } finally {
        hideLoading();
    }
}

// 显示城市选择（搜索结果）
function showCitySelection(cities) {
    // 获取现有的城市选择容器
    const selectionContainer = document.getElementById('city-selection');
    
    if (!selectionContainer) return;
    
    // 清空容器
    selectionContainer.innerHTML = '';
    
    // 创建城市列表
    const cityList = document.createElement('div');
    cityList.id = 'city-list';
    
    // 添加城市选项（使用文档片段批量添加，减少DOM重排）
    const cityFragment = document.createDocumentFragment();
    
    cities.forEach((city, index) => {
        const cityItem = document.createElement('div');
        cityItem.className = 'city-option';
        cityItem.dataset.cityId = city.id;
        
        // 使用立即执行函数创建闭包，确保每个点击事件监听器引用正确的城市对象
        (function(currentCity) {
            cityItem.addEventListener('click', () => {
                console.log('用户点击了城市:', currentCity.name);
                selectCity(currentCity);
            });
        })(city);
        
        const cityInfo = document.createElement('div');
        cityInfo.innerHTML = `
            <div class="city-name">${city.name}</div>
            <div class="city-region">${city.adm1}, ${city.adm2}</div>
        `;
        
        cityItem.appendChild(cityInfo);
        cityFragment.appendChild(cityItem);
    });
    
    // 一次性添加所有城市选项到DOM
    cityList.appendChild(cityFragment);
    
    // 添加到容器
    selectionContainer.appendChild(cityList);
    
    // 显示搜索结果
    showSearchResults();
}

// 选择城市
async function selectCity(city) {
    // 隐藏搜索下拉框
    hideSearchDropdown();
    
    // 构建完整的地区名称：区 + 市 + 省
    let fullCityName = '';
    if (city.name && city.name !== city.adm2 && city.name !== city.adm1) fullCityName += city.name;
    if (city.adm2 && city.adm2 !== city.adm1) {
        if (fullCityName) fullCityName += ` ${city.adm2}`;
        else fullCityName += city.adm2;
    }
    if (city.adm1) {
        if (fullCityName) fullCityName += ` ${city.adm1}`;
        else fullCityName += city.adm1;
    }
    
    // 如果构建的名称为空，使用默认名称
    if (!fullCityName) {
        fullCityName = city.name;
    }
    
    // 获取并显示天气
    try {
        showLoading();
        // 直接使用构建的完整城市名称
        await getWeatherByLocation(parseFloat(city.lat), parseFloat(city.lon), fullCityName);
    } catch (error) {
        console.error('选择城市失败:', error);
        alert('获取天气数据失败，请重试');
    } finally {
        hideLoading();
    }
}

// 获取当前位置
function getCurrentLocation() {
    if (!navigator.geolocation) {
        alert('您的浏览器不支持地理定位功能');
        return;
    }
    
    // 获取位置显示图标元素
    const locationIcon = document.querySelector('.location-display-icon');
    
    // 更新城市名称文本
    DOM_ELEMENTS.cityName.textContent = '正在获取位置...';
    
    // 添加定位动画效果
    if (locationIcon) {
        locationIcon.classList.add('locating', 'rotating');
    }
    
    // 显示占位预报卡片，确保整个定位过程中布局完整
    showPlaceholderForecastCards();
    
    // 不显示全屏加载，只显示动态图标
    // showLoading();
    
    navigator.geolocation.getCurrentPosition(
        async (position) => {
            const { latitude, longitude } = position.coords;
            await getWeatherByLocation(latitude, longitude);
            
            // 移除定位动画效果
            if (locationIcon) {
                locationIcon.classList.remove('locating', 'rotating');
            }
        },
        (error) => {
            console.error('地理定位失败:', error);
            alert('获取位置失败，请检查定位权限设置');
            DOM_ELEMENTS.cityName.textContent = '位置获取失败';
            
            // 移除定位动画效果
            if (locationIcon) {
                locationIcon.classList.remove('locating', 'rotating');
            }
            
            // hideLoading();
        }
    );
}

// 通过城市ID获取天气
async function getWeatherByCityId(cityId) {
    await fetchAndDisplayWeather(cityId, 'cityId', '获取天气数据失败，请检查API配置或网络连接');
}

// 通过经纬度获取天气
async function getWeatherByLocation(latitude, longitude, cityName = null) {
    const location = `${longitude},${latitude}`;
    await fetchAndDisplayWeather(location, 'coords', '获取天气数据失败，请检查网络连接', cityName);
}

// 带缓存的通用API请求函数
async function fetchWithCache(url, options = {}) {
    // 生成缓存键
    const cacheKey = `${url}__${JSON.stringify(options)}`;
    
    // 检查缓存
    const cachedItem = CACHE_CONFIG.cache.get(cacheKey);
    if (cachedItem && Date.now() < cachedItem.expiry) {
        console.log('使用缓存数据:', cacheKey);
        return cachedItem.data;
    }
    
    // 发送请求
    try {
        const response = await fetch(url, {
            headers: {
                'X-QW-Api-Key': API_CONFIG.key,
                'Accept': 'application/json',
                // 移除禁用压缩的设置，让浏览器自动处理压缩
                ...options.headers
            },
            ...options
        });
        
        console.log('Response status:', response.status);
        console.log('Response URL:', response.url);
        
        // 检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP请求失败: ${response.status} - ${response.statusText}`);
        }
        
        // 直接解析JSON响应，浏览器会自动处理gzip压缩
        let data;
        try {
            data = await response.json();
        } catch (parseError) {
            console.error('JSON解析失败，尝试获取原始文本:', parseError);
            const text = await response.text();
            console.log('Raw response text:', text);
            throw new Error(`JSON解析失败: ${parseError.message}`);
        }
        
        console.log('Parsed response data:', data);
        
        // 检查返回数据格式
        if (typeof data !== 'object' || data === null) {
            throw new Error('API返回的数据格式不正确');
        }
        
        // 检查API返回的状态码
        if (data.code && data.code !== '200') {
            throw new Error(`API请求失败: ${data.code} - ${data.msg || '未知错误'}`);
        }
        
        // 保存到缓存
        CACHE_CONFIG.cache.set(cacheKey, {
            data: data,
            expiry: Date.now() + CACHE_CONFIG.expiryTime
        });
        
        return data;
    } catch (error) {
        console.error('API请求失败:', error);
        throw error;
    }
}

// 获取当前天气
async function fetchCurrentWeather(location) {
    const url = `https://${API_CONFIG.host}/v7/weather/now?location=${location}`;
    try {
        const data = await fetchWithCache(url);
        return data;
    } catch (error) {
        console.error('获取当前天气失败:', error);
        return null;
    }
}

// 获取5天预报
async function fetchForecast(location) {
    const url = `https://${API_CONFIG.host}/v7/weather/7d?location=${location}`;
    try {
        const data = await fetchWithCache(url);
        return data.daily;
    } catch (error) {
        console.error('获取5天预报失败:', error);
        return null;
    }
}



// 获取生活指数
async function fetchLifeIndices(location) {
    // 生活指数类型：1-运动指数, 2-洗车指数, 3-穿衣指数, 4-舒适度指数, 5-紫外线指数, 9-感冒指数
    const indicesTypes = '1,2,3,4,5,9';
    const url = `https://${API_CONFIG.host}/v7/indices/1d?location=${location}&type=${indicesTypes}`;
    try {
        const data = await fetchWithCache(url);
        return data.daily;
    } catch (error) {
        console.error('获取生活指数失败:', error);
        return null;
    }
}

// 获取逐小时天气预报
async function fetchHourlyForecast(location) {
    const url = `https://${API_CONFIG.host}/v7/weather/24h?location=${location}`;
    try {
        const data = await fetchWithCache(url);
        return data.hourly;
    } catch (error) {
        console.error('获取逐小时预报失败:', error);
        return null;
    }
}

// 获取天气预警信息
async function fetchWeatherWarnings(location) {
    const url = `https://${API_CONFIG.host}/v7/warning/now?location=${location}`;
    try {
        const data = await fetchWithCache(url);
        return data.warning || [];
    } catch (error) {
        console.error('获取天气预警失败:', error);
        return [];
    }
}

// 通过城市名称获取位置信息
async function getLocationByCityName(cityName) {
    const url = `https://${API_CONFIG.host}/geo/v2/city/lookup?location=${cityName}&range=cn&number=10`;
    const data = await fetchWithCache(url);
    console.log('城市搜索API返回数据:', data);
    return data;
}

// 通过城市ID获取位置信息
async function getLocationByCityId(cityId) {
    return getLocationByCityName(cityId);
}

// 通过经纬度获取位置信息
async function getLocationByCoords(latitude, longitude) {
    const location = `${longitude},${latitude}`;
    return getLocationByCityName(location);
}

// 通用天气获取和显示函数
async function fetchAndDisplayWeather(location, locationType = 'cityId', errorMessage = '获取天气数据失败，请检查网络连接', selectedCityName = null) {
    try {
        showLoading();
        
        // 显示占位预报卡片，保持布局完整
        showPlaceholderForecastCards();
        
        // 获取当前天气
        const currentWeather = await fetchCurrentWeather(location);
        
        // 获取5天预报
        const forecast = await fetchForecast(location);
        
        // 获取生活指数
        const lifeIndices = await fetchLifeIndices(location);
        
        // 获取逐小时预报
        const hourlyForecast = await fetchHourlyForecast(location);
        
        // 获取天气预警信息
        const weatherWarnings = await fetchWeatherWarnings(location);
        
        // 显示当前天气（传递forecast数据以获取准确日期）
        if (currentWeather) {
            displayCurrentWeather(currentWeather, forecast);
        }
        
        // 显示生活指数
        if (lifeIndices) {
            displayLifeIndices(lifeIndices);
        }
        
        // 显示逐小时预报
        if (hourlyForecast) {
            displayHourlyForecast(hourlyForecast);
        }
        
        // 显示天气预警信息
        displayWeatherWarnings(weatherWarnings);
        
        // 保存当前预报数据，用于切换趋势类型
        currentForecastData = forecast;
        
        // 显示预报
        if (forecast) {
            displayForecast(forecast);
            // 显示今天的日出日落信息
            if (forecast.length > 0) {
                displaySunriseSunset(forecast[0]);
            }
        } else {
            // 如果没有预报数据，显示占位符卡片
            showPlaceholderForecastCards();
            // 更新温度趋势图（即使没有数据，也会显示空图表）
            updateTemperatureChart([]);
        }
        
        // 设置城市名称
        if (selectedCityName) {
            // 如果提供了选择的城市名称，直接使用
            DOM_ELEMENTS.cityName.textContent = selectedCityName;
            console.log('使用选择的城市名称:', selectedCityName);
        } else {
            // 否则从API获取城市信息
            let cityInfo;
            if (locationType === 'coords') {
                const [longitude, latitude] = location.split(',');
                cityInfo = await getLocationByCoords(latitude, longitude);
            } else {
                cityInfo = await getLocationByCityId(location);
            }
            
            if (cityInfo && cityInfo.location && cityInfo.location.length > 0) {
                const location = cityInfo.location[0];
                // 构建完整的地区名称：区 + 市 + 省
                let fullLocationName = '';
                if (location.name && location.name !== location.adm2 && location.name !== location.adm1) fullLocationName += location.name;
                if (location.adm2 && location.adm2 !== location.adm1) {
                    if (fullLocationName) fullLocationName += ` ${location.adm2}`;
                    else fullLocationName += location.adm2;
                }
                if (location.adm1) {
                    if (fullLocationName) fullLocationName += ` ${location.adm1}`;
                    else fullLocationName += location.adm1;
                }
                
                // 如果构建的名称为空，使用默认名称
                if (!fullLocationName) {
                    fullLocationName = location.name;
                }
                
                DOM_ELEMENTS.cityName.textContent = fullLocationName;
                console.log('使用API获取的完整地区名称:', fullLocationName);
            }
        }
        
        // 更新时间
        updateLastUpdated();
        
    } catch (error) {
        console.error('获取天气失败:', error);
        alert(errorMessage);
    } finally {
        hideLoading();
    }
}

// 显示当前天气
function displayCurrentWeather(weatherData, forecastData = null) {
    const now = weatherData.now;
    DOM_ELEMENTS.currentTemp.textContent = `${now.temp}°C`;
    DOM_ELEMENTS.weatherDesc.textContent = now.text;
    
    // 显示当前日期+周数
    if (forecastData && forecastData.length > 0) {
        const today = forecastData[0];
        try {
            const date = new Date(today.fxDate);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            const dayOfWeek = weekDays[date.getDay()];
            DOM_ELEMENTS.currentDate.textContent = `${year}-${month}-${day} ${dayOfWeek}`;
        } catch (error) {
            console.error('当前日期格式化错误:', error);
        }
    } else {
        // 如果没有预报数据，使用当前系统日期
        try {
            const nowDate = new Date();
            const year = nowDate.getFullYear();
            const month = String(nowDate.getMonth() + 1).padStart(2, '0');
            const day = String(nowDate.getDate()).padStart(2, '0');
            const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            const dayOfWeek = weekDays[nowDate.getDay()];
            DOM_ELEMENTS.currentDate.textContent = `${year}-${month}-${day} ${dayOfWeek}`;
        } catch (error) {
            console.error('系统日期格式化错误:', error);
        }
    }
    
    DOM_ELEMENTS.feelsLike.textContent = `体感温度 ${now.feelsLike}°C`;
    DOM_ELEMENTS.humidity.textContent = `湿度 ${now.humidity}%`;
    DOM_ELEMENTS.windSpeed.textContent = `风速 ${now.windSpeed}m/s`;
    DOM_ELEMENTS.windDir.textContent = `风向 ${now.windDir || '--'}`;
    DOM_ELEMENTS.windScale.textContent = `风力 ${now.windScale || '--'}级`;
    DOM_ELEMENTS.pressure.textContent = `气压 ${now.pressure}hPa`;
    DOM_ELEMENTS.precip.textContent = `降水量 ${now.precip || '--'}mm`;
    DOM_ELEMENTS.dew.textContent = `露点温度 ${now.dew || '--'}°C`;
    DOM_ELEMENTS.visibility.textContent = `能见度 ${now.vis}米`;
    DOM_ELEMENTS.clouds.textContent = `云量 ${now.cloud || '--'}%`;
    
    // 设置天气图标（使用和风天气官方图标库，失败时使用Font Awesome备用）
    try {
        const iconCode = now.icon || '100';
        // 确保图标代码是字符串，以便用作映射键
        const iconStr = iconCode.toString();
        // 尝试获取Font Awesome图标作为备用
        const fallbackIcon = WEATHER_ICON_MAPPING[iconStr] || WEATHER_ICON_MAPPING['default'];
        
        // 使用Font Awesome图标作为主要解决方案，因为QWeather图标字体文件缺失
        DOM_ELEMENTS.mainIcon.innerHTML = `<i class="${fallbackIcon}"></i>`;
        console.log('当前天气图标:', fallbackIcon);
    } catch (error) {
        console.error('设置天气图标失败:', error);
        // 直接使用Font Awesome默认图标
        DOM_ELEMENTS.mainIcon.innerHTML = `<i class="${WEATHER_ICON_MAPPING['default']}"></i>`;
    }
}

// 添加趋势类型切换事件监听器
function addTrendSwitchListeners() {
    const chartTabs = document.querySelectorAll('.chart-tab');
    chartTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有激活状态
            chartTabs.forEach(t => t.classList.remove('active'));
            // 添加当前激活状态
            tab.classList.add('active');
            // 获取当前趋势类型
            const trendType = tab.dataset.trend;
            // 更新图表
            updateTrendChart(trendType);
        });
    });
}

// 更新趋势图表
function updateTrendChart(trendType) {
    // 更新图表标题
    const chartTitle = document.getElementById('chart-title');
    if (chartTitle) {
        chartTitle.textContent = CHART_TITLES[trendType];
    }
    
    // 准备图表数据（与未来5天预报保持一致，显示未来5天）
    let labels = [];
    if (currentForecastData && currentForecastData.length > 1) {
        labels = currentForecastData.slice(1, 6).map(day => {
            try {
                const date = new Date(day.fxDate);
                // 格式化为 MM-DD 周X，与5天预报保持一致
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const dayOfMonth = String(date.getDate()).padStart(2, '0');
                const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
                const dayOfWeek = weekDays[date.getDay()];
                return `${month}-${dayOfMonth} ${dayOfWeek}`;
            } catch (error) {
                console.error('图表日期格式化错误:', error, day);
                return '?';
            }
        });
    } else {
        // 如果没有数据，使用默认标签
        labels = ['?', '?', '?', '?', '?'];
    }
    
    // 根据趋势类型准备数据
    let datasets = [];
    
    // 定义颜色方案
    const colorSchemes = {
        temperature: {
            max: {
                border: '#ff6b6b',
                background: 'rgba(255, 107, 107, 0.3)',
                point: '#ff6b6b'
            },
            min: {
                border: '#4ecdc4',
                background: 'rgba(78, 205, 196, 0.3)',
                point: '#4ecdc4'
            }
        },
        precipitation: {
            border: '#4fc3f7',
            background: 'rgba(79, 195, 247, 0.3)',
            point: '#4fc3f7'
        },
        humidity: {
            border: '#9575cd',
            background: 'rgba(149, 117, 205, 0.3)',
            point: '#9575cd'
        },
        pressure: {
            border: '#ffb74d',
            background: 'rgba(255, 183, 77, 0.3)',
            point: '#ffb74d'
        },
        visibility: {
            border: '#66bb6a',
            background: 'rgba(102, 187, 106, 0.3)',
            point: '#66bb6a'
        }
    };
    
    // 检查是否有有效数据
    const hasValidData = currentForecastData && currentForecastData.length > 1;
    
    switch (trendType) {
        case 'temperature':
            datasets = [
                {
                    label: '最高温度 (°C)',
                    data: hasValidData ? currentForecastData.slice(1, 6).map(day => parseInt(day.tempMax) || 0) : [0, 0, 0, 0, 0],
                    borderColor: colorSchemes.temperature.max.border,
                    backgroundColor: colorSchemes.temperature.max.background,
                    borderWidth: 3,
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round',
                    fill: true,
                    tension: 0.6,
                    pointBackgroundColor: colorSchemes.temperature.max.point,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: colorSchemes.temperature.max.point,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 4,
                    pointHitRadius: 15,
                    pointShadowColor: 'rgba(0, 0, 0, 0.5)',
                    pointShadowBlur: 10,
                    pointShadowOffsetX: 0,
                    pointShadowOffsetY: 3
                },
                {
                    label: '最低温度 (°C)',
                    data: hasValidData ? currentForecastData.slice(1, 6).map(day => parseInt(day.tempMin) || 0) : [0, 0, 0, 0, 0],
                    borderColor: colorSchemes.temperature.min.border,
                    backgroundColor: colorSchemes.temperature.min.background,
                    borderWidth: 3,
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round',
                    fill: true,
                    tension: 0.6,
                    pointBackgroundColor: colorSchemes.temperature.min.point,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: colorSchemes.temperature.min.point,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 4,
                    pointHitRadius: 15,
                    pointShadowColor: 'rgba(0, 0, 0, 0.5)',
                    pointShadowBlur: 10,
                    pointShadowOffsetX: 0,
                    pointShadowOffsetY: 3
                }
            ];
            break;
            
        case 'precipitation':
        case 'humidity':
        case 'pressure':
        case 'visibility':
            const scheme = colorSchemes[trendType];
            datasets = [
                {
                    label: trendType === 'precipitation' ? '降水量 (mm)' : 
                           trendType === 'humidity' ? '湿度 (%)' :
                           trendType === 'pressure' ? '气压 (hPa)' : '能见度 (km)',
                    data: hasValidData ? currentForecastData.slice(1, 6).map(day => {
                        if (trendType === 'precipitation') return parseFloat(day.precip) || 0;
                        if (trendType === 'humidity') return parseInt(day.humidity) || 0;
                        if (trendType === 'pressure') return parseInt(day.pressure) || 0;
                        if (trendType === 'visibility') return parseFloat(day.vis) || 0;
                        return 0;
                    }) : [0, 0, 0, 0, 0],
                    borderColor: scheme.border,
                    backgroundColor: scheme.background,
                    borderWidth: 3,
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round',
                    fill: true,
                    tension: 0.6,
                    pointBackgroundColor: scheme.point,
                    pointBorderColor: '#fff',
                    pointBorderWidth: 3,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    pointHoverBackgroundColor: scheme.point,
                    pointHoverBorderColor: '#fff',
                    pointHoverBorderWidth: 4,
                    pointHitRadius: 15,
                    pointShadowColor: 'rgba(0, 0, 0, 0.5)',
                    pointShadowBlur: 10,
                    pointShadowOffsetX: 0,
                    pointShadowOffsetY: 3
                }
            ];
            break;

    }
    
    // 销毁现有图表实例
    if (temperatureChart) {
        temperatureChart.destroy();
        temperatureChart = null;
    }
    
    // 检查Chart是否可用
    if (typeof Chart === 'undefined') {
        console.warn('Chart.js未加载，无法显示图表');
        // 清空图表容器
        const ctx = DOM_ELEMENTS.tempChart.getContext('2d');
        ctx.clearRect(0, 0, DOM_ELEMENTS.tempChart.width, DOM_ELEMENTS.tempChart.height);
        return;
    }
    
    try {
        // 创建新图表
        const ctx = DOM_ELEMENTS.tempChart.getContext('2d');
        
        // 创建渐变填充
        datasets = datasets.map(dataset => {
            const gradient = ctx.createLinearGradient(0, 0, 0, 300);
            gradient.addColorStop(0, dataset.backgroundColor);
            gradient.addColorStop(1, dataset.backgroundColor.replace('0.3)', '0)'));
            
            return {
                ...dataset,
                backgroundColor: gradient
            };
        });
        
        temperatureChart = new Chart(DOM_ELEMENTS.tempChart, {
        type: 'line',
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeInOutQuart',
                delay: (context) => {
                    // 为每个数据点添加交错动画
                    return context.dataIndex * 50 + context.datasetIndex * 100;
                },
                onProgress: (animation) => {
                    // 添加绘制过程中的视觉效果
                    if (animation.type === 'progress') {
                        ctx.globalAlpha = animation.currentStep / animation.numSteps;
                    }
                },
                onComplete: () => {
                    ctx.globalAlpha = 1;
                }
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'center',
                    // 控制图例与图表数据之间的距离
                    margin: 60,
                    labels: {
                        color: 'white',
                        font: {
                            size: 14,
                            weight: 'bold',
                            family: 'Arial, sans-serif'
                        },
                        padding: 25,
                        usePointStyle: true,
                        pointStyle: 'circle',
                        boxWidth: 12,
                        boxHeight: 12,
                        textStrokeColor: 'rgba(0, 0, 0, 0.5)',
                        textStrokeWidth: 2,
                        filter: function(context, item, legend) {
                            // 添加图例悬停效果
                            return {
                                filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))'
                            };
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.95)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    borderWidth: 2,
                    padding: 18,
                    displayColors: true,
                    cornerRadius: 12,
                    titleFont: {
                        size: 14,
                        weight: 'bold',
                        family: 'Arial, sans-serif'
                    },
                    bodyFont: {
                        size: 13,
                        family: 'Arial, sans-serif'
                    },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            label += context.parsed.y;
                            return label;
                        },
                        afterLabel: function(context) {
                            // 添加额外信息
                            return ' ';
                        }
                    },
                    mode: 'index',
                    intersect: false,
                    displayColors: true,
                    padding: 15,
                    boxPadding: 8,
                    usePointStyle: true,
                    callbacks: {
                        labelPointStyle: function(context) {
                            return {
                                pointStyle: 'circle',
                                rotation: 0
                            };
                        }
                    }
                },
                // 添加图表背景效果
                background: {
                    color: 'rgba(0, 0, 0, 0.1)'
                }
            },
            scales: {
                y: {
                    beginAtZero: trendType !== 'temperature' && trendType !== 'pressure',
                    grid: {
                        color: 'rgba(255, 255, 255, 0.15)',
                        drawBorder: true,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        lineWidth: 1,
                        drawOnChartArea: true,
                        drawTicks: true
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 13,
                            weight: '500',
                            family: 'Arial, sans-serif'
                        },
                        padding: 15,
                        stepSize: trendType === 'temperature' ? 5 : undefined,
                        backdropColor: 'rgba(0, 0, 0, 0.3)',
                        backdropPadding: 5
                    },
                    border: {
                        color: 'rgba(255, 255, 255, 0.3)',
                        width: 1
                    },
                    // 为温度趋势图在顶部增加额外空间
                    min: function(context) {
                        // 获取所有数据集的最小值
                        const datasets = context.chart.data.datasets;
                        if (datasets.length === 0) return 0;
                        
                        const allValues = datasets.flatMap(dataset => dataset.data);
                        const minValue = Math.min(...allValues);
                        // 确保最小值是5的倍数，并且在最小值下方至少增加5个单位
                        return Math.floor((minValue - 5) / 5) * 5;
                    },
                    max: function(context) {
                        // 获取所有数据集的最大值
                        const datasets = context.chart.data.datasets;
                        if (datasets.length === 0) return 30;
                        
                        const allValues = datasets.flatMap(dataset => dataset.data);
                        const maxValue = Math.max(...allValues);
                        // 确保最大值是5的倍数，并且在最大值上方至少增加5个单位
                        return Math.ceil((maxValue + 5) / 5) * 5;
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)',
                        drawBorder: true,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        lineWidth: 1,
                        drawOnChartArea: false,
                        drawTicks: true
                    },
                    ticks: {
                        color: 'white',
                        font: {
                            size: 13,
                            weight: '500',
                            family: 'Arial, sans-serif'
                        },
                        maxRotation: 0,
                        minRotation: 0,
                        padding: 15,
                        backdropColor: 'rgba(0, 0, 0, 0.3)',
                        backdropPadding: 5
                    },
                    border: {
                        color: 'rgba(255, 255, 255, 0.3)',
                        width: 1
                    }
                }
            },
            elements: {
                line: {
                    tension: 0.6,
                    borderCapStyle: 'round',
                    borderJoinStyle: 'round'
                },
                point: {
                    radius: 6,
                    hitRadius: 15,
                    hoverRadius: 8,
                    hoverBorderWidth: 4
                }
            },
            interaction: {
                mode: 'index',
                intersect: false,
                axis: 'x'
            },
            hover: {
                mode: 'index',
                intersect: false
            },
            layout: {
                padding: {
                    left: 10,
                    right: 10,
                    top: 10,
                    bottom: 10
                }
            }
        }
    });
    } catch (error) {
        console.error('创建趋势图失败:', error);
    }
}

// 更新温度趋势图（保留原函数名，用于向后兼容）
function updateTemperatureChart(forecastData) {
    // 保存当前预报数据
    currentForecastData = forecastData;
    // 更新图表
    updateTrendChart('temperature');
}

// 创建占位预报卡片
function createPlaceholderForecastCard(index) {
    const card = document.createElement('div');
    card.className = 'forecast-card placeholder';
    card.innerHTML = `
        <div class="forecast-date">--/-- --</div>
        <div class="forecast-icon">
            <i class="fas fa-sync-alt fa-spin"></i>
        </div>
        <div class="forecast-temp">
            <span>--°</span>
            <span>--°</span>
        </div>
        <div class="forecast-desc">加载中...</div>
    `;
    return card;
}

// 显示占位预报卡片
function showPlaceholderForecastCards() {
    // 清空现有预报
    DOM_ELEMENTS.forecastList.innerHTML = '';
    
    // 创建5个占位卡片
    for (let i = 0; i < 5; i++) {
        const placeholderCard = createPlaceholderForecastCard(i);
        DOM_ELEMENTS.forecastList.appendChild(placeholderCard);
    }
}

// 显示预报
function displayForecast(forecastData) {
    // 清空现有预报
    DOM_ELEMENTS.forecastList.innerHTML = '';
    
    // 只显示未来5天
    const next5Days = forecastData.slice(1, 6);
    
    next5Days.forEach(day => {
        const forecastCard = createForecastCard(day);
        DOM_ELEMENTS.forecastList.appendChild(forecastCard);
    });
    
    // 保存当前预报数据，用于切换趋势类型
    currentForecastData = forecastData;
    
    // 更新温度趋势图
    updateTemperatureChart(forecastData);
    
    // 添加趋势类型切换事件监听器（只添加一次）
    if (!window.trendListenersAdded) {
        addTrendSwitchListeners();
        window.trendListenersAdded = true;
    }
}

// 创建预报卡片
function createForecastCard(dayData) {
    const card = document.createElement('div');
    card.className = 'forecast-card';
    
    // 格式化日期
    let formattedDate = '?';
    try {
        const date = new Date(dayData.fxDate);
        // 格式化为 MM-DD 周X
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
        const dayOfWeek = weekDays[date.getDay()];
        formattedDate = `${month}-${day} ${dayOfWeek}`;
    } catch (error) {
        console.error('日期格式化错误:', error);
        formattedDate = '?';
    }
    
    // 天气图标（使用和风天气官方图标库，失败时使用Font Awesome备用）
    let iconClass = DEFAULT_WEATHER_ICON;
    try {
        const iconCode = dayData.iconDay || '100';
        // 确保图标代码是字符串，以便用作映射键
        const iconStr = iconCode.toString();
        // 尝试获取Font Awesome图标作为备用
        const fallbackIcon = WEATHER_ICON_MAPPING[iconStr] || WEATHER_ICON_MAPPING['default'];
        
        // 使用Font Awesome图标作为主要解决方案，因为QWeather图标字体文件缺失
        iconClass = fallbackIcon;
        console.log('预报天气图标:', iconClass, '图标代码:', iconCode);
    } catch (error) {
        console.error('设置预报天气图标失败:', error);
        // 直接使用Font Awesome默认图标
        iconClass = WEATHER_ICON_MAPPING['default'];
    }
    
    card.innerHTML = `
        <div class="forecast-date">${formattedDate}</div>
        <div class="forecast-icon">
            <i class="${iconClass}"></i>
        </div>
        <div class="forecast-temp">
            <span>${dayData.tempMax}°</span>
            <span>${dayData.tempMin}°</span>
        </div>
        <div class="forecast-desc">${dayData.textDay || dayData.textNight || '?'}</div>
    `;
    
    return card;
}

// 显示日出日落信息
function displaySunriseSunset(dayData) {
    DOM_ELEMENTS.sunrise.textContent = `日出 ${dayData.sunrise}`;
    DOM_ELEMENTS.sunset.textContent = `日落 ${dayData.sunset}`;
}



// 生活指数图标映射
const LIFE_INDICES_ICONS = {
    1: 'fas fa-running',      // 运动指数
    2: 'fas fa-car',          // 洗车指数
    3: 'fas fa-tshirt',       // 穿衣指数
    4: 'fas fa-smile',        // 舒适度指数
    5: 'fas fa-sun',          // 紫外线指数
    9: 'fas fa-thermometer-half', // 感冒指数
};

// 生活指数等级颜色映射
const LIFE_INDICES_COLORS = {
    1: '#00e400',  // 优
    2: '#ffff00',  // 良
    3: '#ff7e00',  // 中等
    4: '#ff0000',  // 较差
    5: '#8f3f97',  // 差
    6: '#7e0023'   // 极差
};

// 生活指数类型名称映射
const LIFE_INDICES_NAMES = {
    1: '运动指数',
    2: '洗车指数',
    3: '穿衣指数',
    4: '舒适度指数',
    5: '紫外线指数',
    9: '感冒指数'
};

// 显示生活指数信息
function displayLifeIndices(indicesData) {
    const container = DOM_ELEMENTS.lifeIndices;
    container.innerHTML = '';
    
    if (!indicesData) {
        // 如果生活指数数据获取失败，显示默认提示
        const defaultCard = document.createElement('div');
        defaultCard.className = 'index-card';
        defaultCard.innerHTML = `
            <div class="index-header">
                <i class="fas fa-info-circle"></i>
                <h3>生活指数</h3>
            </div>
            <div class="index-content">
                <div class="index-level">暂无数据</div>
                <p class="index-desc">无法获取生活指数数据</p>
            </div>
        `;
        container.appendChild(defaultCard);
        return;
    }
    
    // 在浏览器控制台中打印完整的生活指数数据
    console.log('完整生活指数数据:', indicesData);
    // 将数据转换为字符串并显示在页面上，以便调试
    console.log('生活指数数据JSON:', JSON.stringify(indicesData, null, 2));
    
    indicesData.forEach(index => {
        const indexCard = document.createElement('div');
        indexCard.className = 'index-card';
        
        // 解析type值
        const type = parseInt(index.type);
        
        // 直接使用type值获取名称和图标，简化逻辑
        let name = LIFE_INDICES_NAMES[type] || index.name || '未知指数';
        let iconClass = LIFE_INDICES_ICONS[type] || 'fas fa-question';
        
        // 针对洗车指数，直接使用固定值
        if (type === 2 || name.includes('洗车') || (index.text && index.text.includes('洗车'))) {
            name = '洗车指数';
            // 使用更常见的汽车图标测试
            iconClass = 'fas fa-car';
        }
        const level = parseInt(index.level);
        const color = LIFE_INDICES_COLORS[level] || '#ffffff';
        
        // 调试信息：打印每个指数的类型和图标类
        console.log(`生活指数: ${name}, type: ${index.type}, 转换后type: ${type}, 图标类: ${iconClass}`);
        
        indexCard.innerHTML = `
            <div class="index-header">
                <i class="${iconClass}" style="color: ${color};"></i>
                <h3>${name}</h3>
            </div>
            <div class="index-content">
                <div class="index-level" style="color: ${color};">${index.category}</div>
                <p class="index-desc">${index.text}</p>
            </div>
        `;
        
        container.appendChild(indexCard);
    });
}

// 显示逐小时预报
function displayHourlyForecast(hourlyData) {
    const container = DOM_ELEMENTS.hourlyForecast;
    container.innerHTML = '';
    
    if (!hourlyData) {
        // 如果逐小时预报数据获取失败，显示默认提示
        const defaultCard = document.createElement('div');
        defaultCard.className = 'hourly-card';
        defaultCard.innerHTML = `
            <div class="hourly-time">--:--</div>
            <div class="hourly-icon">
                <i class="fas fa-info-circle"></i>
            </div>
            <div class="hourly-temp">--°C</div>
            <div class="hourly-desc">暂无数据</div>
            <div class="hourly-wind">
                <i class="fas fa-wind"></i>--m/s
            </div>
        `;
        container.appendChild(defaultCard);
        return;
    }
    
    hourlyData.forEach(hour => {
        const hourCard = document.createElement('div');
        hourCard.className = 'hourly-card';
        
        // 格式化时间，只显示小时
        const hourTime = new Date(hour.fxTime);
        const formattedHour = hourTime.getHours().toString().padStart(2, '0');
        
        // 获取天气图标（使用Font Awesome，因为QWeather字体文件缺失）
        let iconClass;
        try {
            const iconCode = hour.icon || '100';
            // 使用图标映射获取Font Awesome图标类名
            iconClass = WEATHER_ICON_MAPPING[iconCode] || WEATHER_ICON_MAPPING['default'];
        } catch (error) {
            console.error('设置逐小时天气图标失败:', error);
            iconClass = WEATHER_ICON_MAPPING['default'];
        }
        
        hourCard.innerHTML = `
            <div class="hourly-time">${formattedHour}:00</div>
            <div class="hourly-icon">
                <i class="${iconClass}"></i>
            </div>
            <div class="hourly-temp">${hour.temp}°C</div>
            <div class="hourly-desc">${hour.text}</div>
            <div class="hourly-wind">
                <i class="fas fa-wind"></i>${hour.windSpeed}m/s
            </div>
        `;
        
        container.appendChild(hourCard);
    });
}

// 天气预警等级颜色映射
const WARNING_COLORS = {
    blue: '#0099ff',      // 蓝色预警
    yellow: '#ffff00',    // 黄色预警
    orange: '#ff6600',    // 橙色预警
    red: '#ff0000'        // 红色预警
};

// 当前显示的预警索引
let currentWarningIndex = 0;
let allWarnings = [];

// 显示天气预警弹窗
function showWarningModal() {
    DOM_ELEMENTS.warningModal.classList.add('show');
}

// 关闭天气预警弹窗
function closeWarningModal() {
    DOM_ELEMENTS.warningModal.classList.remove('show');
    currentWarningIndex = 0;
}

// 格式化发布时间，去掉时区信息
function formatWarningTime(timeString) {
    if (!timeString) return '';
    
    // 将ISO时间格式转换为友好格式，去掉时区
    const date = new Date(timeString);
    return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Shanghai'
    });
}

// 显示当前预警信息
function displayCurrentWarning() {
    if (!allWarnings || allWarnings.length === 0) {
        return;
    }
    
    const warning = allWarnings[currentWarningIndex];
    const levelColor = WARNING_COLORS[warning.level] || WARNING_COLORS.yellow;
    
    // 处理预警等级文本，避免显示undefined
    const levelText = warning.levelText || '';
    
    // 格式化发布时间，去掉时区信息
    const formattedTime = formatWarningTime(warning.pubTime);
    
    DOM_ELEMENTS.warningContent.innerHTML = `
        <div class="warning-card">
            <div class="warning-header" style="background-color: ${levelColor};">
                <i class="fas fa-exclamation-triangle"></i>
                <span class="warning-type">${warning.typeName}</span>
                ${levelText ? `<span class="warning-level">${levelText}</span>` : ''}
            </div>
            <div class="warning-content">
                <p class="warning-text">${warning.text}</p>
                <p class="warning-time">发布时间: ${formattedTime}</p>
            </div>
        </div>
    `;
    
    // 更新导航按钮状态
    updateWarningNavigation();
}

// 更新预警导航按钮
function updateWarningNavigation() {
    if (!allWarnings || allWarnings.length <= 1) {
        DOM_ELEMENTS.warningNav.innerHTML = '';
        return;
    }
    
    let navHTML = '';
    for (let i = 0; i < allWarnings.length; i++) {
        const warning = allWarnings[i];
        // 使用预警类型作为按钮标题
        const warningType = warning.typeName || `预警${i + 1}`;
        navHTML += `
            <button class="warning-nav-btn ${i === currentWarningIndex ? 'active' : ''}" data-index="${i}" title="${warningType}">
                ${warningType.length > 4 ? warningType.substring(0, 4) + '...' : warningType}
            </button>
        `;
    }
    
    DOM_ELEMENTS.warningNav.innerHTML = navHTML;
    
    // 添加导航按钮事件监听
    document.querySelectorAll('.warning-nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            currentWarningIndex = parseInt(this.dataset.index);
            displayCurrentWarning();
        });
    });
}

// 显示天气预警信息
function displayWeatherWarnings(warnings) {
    allWarnings = warnings || [];
    
    // 隐藏原有的天气预警区域（如果元素存在）
    if (DOM_ELEMENTS.weatherWarnings) {
        DOM_ELEMENTS.weatherWarnings.style.display = 'none';
    }
    
    if (!allWarnings || allWarnings.length === 0) {
        closeWarningModal();
        return;
    }
    
    // 显示预警弹窗
    showWarningModal();
    
    // 显示第一个预警信息
    currentWarningIndex = 0;
    displayCurrentWarning();
}

// 添加预警弹窗事件监听
function addWarningModalEventListeners() {
    // 关闭按钮事件监听
    DOM_ELEMENTS.closeWarning.addEventListener('click', closeWarningModal);
    
    // 点击弹窗外部关闭弹窗
    DOM_ELEMENTS.warningModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeWarningModal();
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeWarningModal();
        }
    });
}

// 函数：添加预警弹窗事件监听
function addWarningModalEventListeners() {
    // 确保DOM元素已经初始化
    if (!DOM_ELEMENTS || !DOM_ELEMENTS.closeWarning || !DOM_ELEMENTS.warningModal) {
        console.warn('DOM元素尚未初始化，无法添加预警弹窗事件监听');
        return;
    }
    
    // 关闭按钮事件监听
    DOM_ELEMENTS.closeWarning.addEventListener('click', closeWarningModal);
    
    // 点击弹窗外部关闭弹窗
    DOM_ELEMENTS.warningModal.addEventListener('click', function(e) {
        if (e.target === this) {
            closeWarningModal();
        }
    });
    
    // ESC键关闭弹窗
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeWarningModal();
        }
    });
}

// 更新最后更新时间
function updateLastUpdated() {
    const now = new Date();
    const formattedTime = now.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
    DOM_ELEMENTS.updateTime.textContent = formattedTime;
}

// 初始化应用
document.addEventListener('DOMContentLoaded', initApp);

// 显示/隐藏分享选项
function toggleShareOptions() {
    DOM_ELEMENTS.shareOptions.classList.toggle('show');
}

// 处理分享选项点击
function handleShareOption(e) {
    const action = e.currentTarget.dataset.action;
    
    // 关闭分享选项
    DOM_ELEMENTS.shareOptions.classList.remove('show');
    
    switch (action) {
        case 'save-image':
            generateShareCard();
            break;
        case 'show-preview':
            showWebPreview();
            break;
        case 'save-pdf':
            saveAsPDF();
            break;
        case 'browser-share':
            shareWeather();
            break;
        case 'copy-link':
            copyWeatherLink();
            break;
        case 'copy-text':
            copyWeatherText();
            break;
        default:
            console.error('未知的分享动作:', action);
    }
}

// 显示网页预览
function showWebPreview() {
    // 移除showLoading()调用，避免截图时捕获到加载遮罩
    
    try {
        const container = document.querySelector('.container');
        if (!container) {
            console.error('找不到容器元素');
            return;
        }
        
        // 获取container的位置和尺寸信息
        const containerRect = container.getBoundingClientRect();
        
        // 首先截取整个body，获取完整的渐变背景
        html2canvas(document.body, {
            scale: 1, // 降低分辨率，提高性能
            useCORS: true, // 允许跨域图片
            backgroundColor: null, // 设置为null以保留原网页背景
            logging: false, // 关闭日志
            allowTaint: true,
            foreignObjectRendering: false // 禁用foreignObjectRendering，提高兼容性
        })
        .then((fullCanvas) => {
            // 创建一个新的canvas，用于裁剪出container区域
            const croppedCanvas = document.createElement('canvas');
            const ctx = croppedCanvas.getContext('2d');
            
            // 设置裁剪后的canvas尺寸为container的尺寸
            croppedCanvas.width = containerRect.width;
            croppedCanvas.height = containerRect.height;
            
            // 从完整的canvas中裁剪出container区域
            ctx.drawImage(
                fullCanvas, 
                containerRect.left, // 源图像的x坐标
                containerRect.top, // 源图像的y坐标
                containerRect.width, // 源图像的宽度
                containerRect.height, // 源图像的高度
                0, // 目标图像的x坐标
                0, // 目标图像的y坐标
                containerRect.width, // 目标图像的宽度
                containerRect.height // 目标图像的高度
            );
            
            console.log('网页预览canvas生成成功，尺寸:', croppedCanvas.width, 'x', croppedCanvas.height);
            
            // 创建一个临时的预览窗口
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write('<html><head><title>网页预览</title>');
            previewWindow.document.write('<style>body { margin: 0; padding: 20px; background-color: #f0f0f0; display: flex; justify-content: center; align-items: center; min-height: 100vh; } img { max-width: 100%; max-height: 100%; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2); }</style>');
            previewWindow.document.write('</head><body>');
            previewWindow.document.write('<img src="' + croppedCanvas.toDataURL('image/png') + '" alt="网页预览">');
            previewWindow.document.write('</body></html>');
            previewWindow.document.close();
            
            console.log('网页预览已打开');
        })
        .catch((error) => {
            console.error('生成网页预览失败:', error);
        });
    } catch (error) {
        console.error('生成网页预览失败:', error);
    }
}

// 分享天气信息 - 调用浏览器自带分享功能
function shareWeather() {
    // 获取当前天气信息
    const cityName = DOM_ELEMENTS.cityName.textContent;
    const currentTemp = DOM_ELEMENTS.currentTemp.textContent;
    const weatherDesc = DOM_ELEMENTS.weatherDesc.textContent;
    const currentDate = DOM_ELEMENTS.currentDate.textContent;
    
    // 构建分享文本
    const shareText = `${cityName}当前天气
${currentDate}
温度: ${currentTemp}
天气: ${weatherDesc}`;
    
    // 构建分享URL
    const shareUrl = window.location.href;
    
    // 使用Web Share API（如果浏览器支持）
    if (navigator.share) {
        navigator.share({
            title: `${cityName}天气`,
            text: shareText,
            url: shareUrl
        })
        .then(() => {
            console.log('分享成功');
        })
        .catch((error) => {
            console.error('分享失败:', error);
        });
    } else {
        console.error('您的浏览器不支持分享功能');
    }
}

// 复制天气链接到剪贴板
function copyWeatherLink() {
    const shareUrl = window.location.href;
    copyToClipboard(shareUrl, '天气链接已复制到剪贴板！');
}

// 复制天气文本到剪贴板
function copyWeatherText() {
    // 获取当前天气信息
    const cityName = DOM_ELEMENTS.cityName.textContent;
    const currentTemp = DOM_ELEMENTS.currentTemp.textContent;
    const weatherDesc = DOM_ELEMENTS.weatherDesc.textContent;
    const currentDate = DOM_ELEMENTS.currentDate.textContent;
    
    // 构建分享文本
    const shareText = `${cityName}当前天气
${currentDate}
温度: ${currentTemp}
天气: ${weatherDesc}`;
    
    copyToClipboard(shareText, '天气信息已复制到剪贴板！');
}

// 复制文本到剪贴板
function copyToClipboard(text, successMessage = '复制成功！') {
    // 使用Clipboard API（如果浏览器支持）
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
            .then(() => {
                console.log('复制到剪贴板成功');
            })
            .catch((error) => {
                console.error('复制到剪贴板失败:', error);
                // 降级使用传统方法
                copyToClipboardFallback(text, successMessage);
            });
    } else {
        // 降级使用传统方法
        copyToClipboardFallback(text, successMessage);
    }
}

// 传统复制到剪贴板方法（兼容旧浏览器）
function copyToClipboardFallback(text, successMessage = '复制成功！') {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            console.log('复制到剪贴板成功');
        } else {
            console.error('复制到剪贴板失败');
        }
    } catch (error) {
        console.error('复制到剪贴板失败:', error);
    }
    
    document.body.removeChild(textArea);
}

// 根据天气状况生成暖心留言
function generateWarmMessage(weatherDesc) {
    const messages = {
        // 晴天相关
        '晴': [
            '今天天气晴朗，适合出门走走，享受阳光的温暖！',
            '阳光明媚的一天，记得涂防晒霜哦！',
            '晴天好心情，愿你今天充满活力！',
            '蓝天白云，适合拍照的好天气！',
            '阳光正好，微风不燥，这就是最美的日子！',
            '阳光洒在身上，心情也跟着灿烂起来！',
            '晴空万里，适合来一场说走就走的旅行！',
            '阳光温暖，岁月静好，珍惜每一天！',
            '晴天的阳光是最好的滤镜！',
            '今天的阳光，是大自然给的最好礼物！',
            '阳光明媚，万物可爱，人间值得！',
            '在阳光下，一切都显得那么美好！'
        ],
        // 多云相关
        '多云': [
            '多云天气，温度适宜，适合户外活动！',
            '云朵飘飘，今天的天空像一幅画！',
            '多云转晴，天气会越来越好的！',
            '云层遮挡了阳光，但挡不住你的好心情！',
            '多云天气，记得带件外套，早晚温差大！',
            '云朵像棉花糖一样，挂在天空中！',
            '多云天气，适合野餐和放风筝！',
            '云层变化万千，每一刻都不同！',
            '多云的天空，给人一种温柔的感觉！',
            '今天的云，是天空写的诗！',
            '多云天气，不晒也不冷，刚刚好！',
            '看着天上的云，心情也跟着放松了！'
        ],
        // 雨天相关
        '雨': [
            '雨天路滑，出行注意安全！',
            '雨声潺潺，适合在家看书喝茶！',
            '记得带伞，不要被雨淋湿了！',
            '雨后空气清新，深呼吸一下吧！',
            '雨天也要保持好心情，因为雨过天晴！',
            '听着雨声，仿佛整个世界都安静了！',
            '雨天适合睡懒觉，享受悠闲时光！',
            '雨中漫步，也是一种浪漫！',
            '雨后的彩虹，是大自然的惊喜！',
            '雨天，给大地洗个澡！',
            '撑着伞，走在雨中，别有一番风味！',
            '雨天，让城市变得更加清新！'
        ],
        // 雪天相关
        '雪': [
            '下雪了！可以堆雪人、打雪仗了！',
            '雪天路滑，注意保暖和安全！',
            '银装素裹的世界，真美！',
            '下雪天，适合在家吃火锅！',
            '雪花纷飞，愿你的心情也如雪般纯净！',
            '雪地里的脚印，是冬天的诗行！',
            '雪花飘落的瞬间，整个世界都安静了！',
            '下雪天，和家人一起烤火取暖，幸福满满！',
            '雪后的世界，宛如童话王国！',
            '雪花是冬天送给大地的礼物！',
            '在雪地里打滚，找回童年的快乐！',
            '雪天，让一切都变得洁白无瑕！'
        ],
        // 阴天相关
        '阴': [
            '阴天也有阴天的美，享受这份宁静！',
            '阴天适合思考，整理一下自己的思绪吧！',
            '虽然阴天，但你的笑容可以照亮一切！',
            '阴天多穿点，注意保暖！',
            '阴云终会散去，阳光总会到来！',
            '阴天，适合在家看电影、听音乐！',
            '阴天的空气，格外清新！',
            '阴天，给人一种沉稳的感觉！',
            '即使阴天，也要保持内心的阳光！',
            '阴天，适合反思和总结！',
            '阴天的天空，像一幅水墨画！',
            '阴天，让我们更加珍惜阳光的温暖！'
        ],
        // 雾天相关
        '雾': [
            '雾天能见度低，开车要慢行！',
            '雾蒙蒙的世界，宛如仙境！',
            '雾天适合戴口罩，保护呼吸道！',
            '雾气会慢慢散去，耐心等待！',
            '雾天虽朦胧，但内心要明亮！',
            '雾中的城市，像笼罩着一层神秘的面纱！',
            '雾天，仿佛置身于梦幻世界！',
            '雾气让远处的景物若隐若现，别有一番韵味！',
            '雾天，适合拍一些朦胧美的照片！',
            '雾气是大自然的化妆师！',
            '雾天，让一切都变得温柔起来！',
            '雾散之后，又是一个晴朗的天空！'
        ]
    };
    
    // 根据天气描述匹配对应的留言
    for (const [key, value] of Object.entries(messages)) {
        if (weatherDesc.includes(key)) {
            // 随机选择一条留言
            return value[Math.floor(Math.random() * value.length)];
        }
    }
    
    // 默认留言
    const defaultMessages = [
        '无论天气如何，保持好心情最重要！',
        '今天也是美好的一天！',
        '记得多喝水，照顾好自己！',
        '天气在变，对你的关心不变！',
        '愿你今天一切顺利！',
        '每一天都是新的开始，加油！',
        '保持微笑，好运自然来！',
        '生活很美好，记得要开心！',
        '每一天都值得被珍惜！',
        '无论晴天雨天，都是生活的一部分！',
        '好好照顾自己，身体是革命的本钱！',
        '心若向阳，无畏悲伤！',
        '每一天都有新的希望！',
        '微笑面对生活，生活也会对你微笑！',
        '保持积极心态，一切都会好起来的！'
    ];
    
    return defaultMessages[Math.floor(Math.random() * defaultMessages.length)];
}

// 根据天气状况选择背景图片类名
function getWeatherBackgroundClass(weatherDesc) {
    if (weatherDesc.includes('晴')) {
        return 'sunny';
    } else if (weatherDesc.includes('云')) {
        return 'cloudy';
    } else if (weatherDesc.includes('雨')) {
        return 'rainy';
    } else if (weatherDesc.includes('雪')) {
        return 'snowy';
    } else {
        return 'default';
    }
}

// 准备分享卡片内容
function prepareShareCard() {
    // 获取当前天气信息
    const cityName = DOM_ELEMENTS.cityName.textContent;
    const currentTemp = DOM_ELEMENTS.currentTemp.textContent;
    const weatherDesc = DOM_ELEMENTS.weatherDesc.textContent;
    const currentDate = DOM_ELEMENTS.currentDate.textContent;
    
    // 设置分享卡片内容
    DOM_ELEMENTS.shareCityName.textContent = cityName;
    DOM_ELEMENTS.shareDate.textContent = currentDate;
    DOM_ELEMENTS.shareTemp.textContent = currentTemp;
    DOM_ELEMENTS.shareDesc.textContent = weatherDesc;
    
    // 设置天气图标
    const mainIcon = DOM_ELEMENTS.mainIcon.innerHTML;
    DOM_ELEMENTS.shareIcon.innerHTML = mainIcon;
    
    // 生成暖心留言
    const warmMessage = generateWarmMessage(weatherDesc);
    DOM_ELEMENTS.warmMessage.textContent = warmMessage;
    
    // 设置背景图片
    const backgroundClass = getWeatherBackgroundClass(weatherDesc);
    DOM_ELEMENTS.shareCard.className = `share-card ${backgroundClass}`;
}

// 生成分享卡片 - 显示预览界面
function generateShareCard() {
    // 准备分享卡片内容
    prepareShareCard();
    
    // 同步更新预览卡片内容
    updatePreviewCard();
    
    // 显示预览界面
    showPreviewModal();
}

// 更新预览卡片内容
function updatePreviewCard() {
    // 同步分享卡片的内容到预览卡片
    DOM_ELEMENTS.previewCityName.textContent = DOM_ELEMENTS.shareCityName.textContent;
    DOM_ELEMENTS.previewDate.textContent = DOM_ELEMENTS.shareDate.textContent;
    DOM_ELEMENTS.previewTemp.textContent = DOM_ELEMENTS.shareTemp.textContent;
    DOM_ELEMENTS.previewDesc.textContent = DOM_ELEMENTS.shareDesc.textContent;
    DOM_ELEMENTS.previewIcon.innerHTML = DOM_ELEMENTS.shareIcon.innerHTML;
    DOM_ELEMENTS.previewWarmMessage.textContent = DOM_ELEMENTS.warmMessage.textContent;
    
    // 同步背景类
    const currentBgClass = DOM_ELEMENTS.shareCard.className.replace('share-card ', '');
    DOM_ELEMENTS.previewCard.className = `share-card ${currentBgClass}`;
    
    // 保存当前可用的暖心留言列表
    currentMessages = generateMessagesForCurrentWeather();
    // 保存当前留言索引
    currentMessageIndex = currentMessages.indexOf(DOM_ELEMENTS.warmMessage.textContent);
    // 如果当前留言不在列表中，默认设为0
    if (currentMessageIndex === -1) {
        currentMessageIndex = 0;
        DOM_ELEMENTS.warmMessage.textContent = currentMessages[0];
        DOM_ELEMENTS.previewWarmMessage.textContent = currentMessages[0];
    }
}

// 生成当前天气可用的暖心留言列表
function generateMessagesForCurrentWeather() {
    const weatherDesc = DOM_ELEMENTS.weatherDesc.textContent;
    const messages = {
        // 晴天相关
        '晴': [
            '今天天气晴朗，适合出门走走，享受阳光的温暖！',
            '阳光明媚的一天，记得涂防晒霜哦！',
            '晴天好心情，愿你今天充满活力！',
            '蓝天白云，适合拍照的好天气！',
            '阳光正好，微风不燥，这就是最美的日子！',
            '阳光洒在身上，心情也跟着灿烂起来！',
            '晴空万里，适合来一场说走就走的旅行！',
            '阳光温暖，岁月静好，珍惜每一天！',
            '晴天的阳光是最好的滤镜！',
            '今天的阳光，是大自然给的最好礼物！',
            '阳光明媚，万物可爱，人间值得！',
            '在阳光下，一切都显得那么美好！'
        ],
        // 多云相关
        '多云': [
            '多云天气，温度适宜，适合户外活动！',
            '云朵飘飘，今天的天空像一幅画！',
            '多云转晴，天气会越来越好的！',
            '云层遮挡了阳光，但挡不住你的好心情！',
            '多云天气，记得带件外套，早晚温差大！',
            '云朵像棉花糖一样，挂在天空中！',
            '多云天气，适合野餐和放风筝！',
            '云层变化万千，每一刻都不同！',
            '多云的天空，给人一种温柔的感觉！',
            '今天的云，是天空写的诗！',
            '多云天气，不晒也不冷，刚刚好！',
            '看着天上的云，心情也跟着放松了！'
        ],
        // 雨天相关
        '雨': [
            '雨天路滑，出行注意安全！',
            '雨声潺潺，适合在家看书喝茶！',
            '记得带伞，不要被雨淋湿了！',
            '雨后空气清新，深呼吸一下吧！',
            '雨天也要保持好心情，因为雨过天晴！',
            '听着雨声，仿佛整个世界都安静了！',
            '雨天适合睡懒觉，享受悠闲时光！',
            '雨中漫步，也是一种浪漫！',
            '雨后的彩虹，是大自然的惊喜！',
            '雨天，给大地洗个澡！',
            '撑着伞，走在雨中，别有一番风味！',
            '雨天，让城市变得更加清新！'
        ],
        // 雪天相关
        '雪': [
            '下雪了！可以堆雪人、打雪仗了！',
            '雪天路滑，注意保暖和安全！',
            '银装素裹的世界，真美！',
            '下雪天，适合在家吃火锅！',
            '雪花纷飞，愿你的心情也如雪般纯净！',
            '雪地里的脚印，是冬天的诗行！',
            '雪花飘落的瞬间，整个世界都安静了！',
            '下雪天，和家人一起烤火取暖，幸福满满！',
            '雪后的世界，宛如童话王国！',
            '雪花是冬天送给大地的礼物！',
            '在雪地里打滚，找回童年的快乐！',
            '雪天，让一切都变得洁白无瑕！'
        ],
        // 阴天相关
        '阴': [
            '阴天也有阴天的美，享受这份宁静！',
            '阴天适合思考，整理一下自己的思绪吧！',
            '虽然阴天，但你的笑容可以照亮一切！',
            '阴天多穿点，注意保暖！',
            '阴云终会散去，阳光总会到来！',
            '阴天，适合在家看电影、听音乐！',
            '阴天的空气，格外清新！',
            '阴天，给人一种沉稳的感觉！',
            '即使阴天，也要保持内心的阳光！',
            '阴天，适合反思和总结！',
            '阴天的天空，像一幅水墨画！',
            '阴天，让我们更加珍惜阳光的温暖！'
        ],
        // 雾天相关
        '雾': [
            '雾天能见度低，开车要慢行！',
            '雾蒙蒙的世界，宛如仙境！',
            '雾天适合戴口罩，保护呼吸道！',
            '雾气会慢慢散去，耐心等待！',
            '雾天虽朦胧，但内心要明亮！',
            '雾中的城市，像笼罩着一层神秘的面纱！',
            '雾天，仿佛置身于梦幻世界！',
            '雾气让远处的景物若隐若现，别有一番韵味！',
            '雾天，适合拍一些朦胧美的照片！',
            '雾气是大自然的化妆师！',
            '雾天，让一切都变得温柔起来！',
            '雾散之后，又是一个晴朗的天空！'
        ]
    };
    
    // 根据天气描述匹配对应的留言列表
    for (const [key, value] of Object.entries(messages)) {
        if (weatherDesc.includes(key)) {
            return value;
        }
    }
    
    // 默认留言列表
    return [
        '无论天气如何，保持好心情最重要！',
        '今天也是美好的一天！',
        '记得多喝水，照顾好自己！',
        '天气在变，对你的关心不变！',
        '愿你今天一切顺利！',
        '每一天都是新的开始，加油！',
        '保持微笑，好运自然来！',
        '生活很美好，记得要开心！',
        '每一天都值得被珍惜！',
        '无论晴天雨天，都是生活的一部分！',
        '好好照顾自己，身体是革命的本钱！',
        '心若向阳，无畏悲伤！',
        '每一天都有新的希望！',
        '微笑面对生活，生活也会对你微笑！',
        '保持积极心态，一切都会好起来的！'
    ];
}

// 显示预览模态框
function showPreviewModal() {
    DOM_ELEMENTS.imagePreviewModal.classList.add('show');
    // 阻止页面滚动
    document.body.style.overflow = 'hidden';
}

// 关闭预览模态框
function closePreviewModal() {
    DOM_ELEMENTS.imagePreviewModal.classList.remove('show');
    // 恢复页面滚动
    document.body.style.overflow = '';
}

// 当前留言索引和留言列表
let currentMessageIndex = 0;
let currentMessages = [];

// 随机切换背景
function randomBackground() {
    // 背景类型数组 - 包含所有背景变体
    const bgTypes = [
        // 晴天背景
        'sunny', 'sunny-2', 'sunny-3',
        // 多云背景
        'cloudy', 'cloudy-2', 'cloudy-3',
        // 雨天背景
        'rainy', 'rainy-2', 'rainy-3',
        // 雪天背景
        'snowy', 'snowy-2', 'snowy-3',
        // 默认背景
        'default', 'default-2', 'default-3', 'default-4', 'default-5'
    ];
    // 随机选择一个背景类型
    const randomBg = bgTypes[Math.floor(Math.random() * bgTypes.length)];
    // 应用背景
    DOM_ELEMENTS.previewCard.className = `share-card ${randomBg}`;
}

// 随机留言
function randomMessage() {
    if (currentMessages.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * currentMessages.length);
    currentMessageIndex = randomIndex;
    const message = currentMessages[randomIndex];
    DOM_ELEMENTS.previewWarmMessage.textContent = message;
    DOM_ELEMENTS.warmMessage.textContent = message;
}

// 保存预览图片
function savePreviewImage() {
    // 使用隐藏的share-card-container来生成图片，避免预览卡片的样式问题
    const shareCardContainer = DOM_ELEMENTS.shareCardContainer;
    const shareCard = DOM_ELEMENTS.shareCard;
    
    if (!shareCardContainer || !shareCard) {
        console.error('找不到分享卡片容器或卡片元素');
        return;
    }
    
    showLoading();
    
    try {
        // 保存原始样式
        const originalDisplay = shareCardContainer.style.display;
        const originalPosition = shareCardContainer.style.position;
        
        // 临时显示分享卡片容器
        shareCardContainer.style.display = 'flex';
        shareCardContainer.style.position = 'absolute';
        shareCardContainer.style.top = '-9999px';
        shareCardContainer.style.left = '-9999px';
        
        // 临时移除圆角，改为直角
        const originalBorderRadius = shareCard.style.borderRadius;
        shareCard.style.borderRadius = '0';
        
        // 使用html2canvas将隐藏的分享卡片转换为canvas
        html2canvas(shareCard, {
            scale: 2, // 提高分辨率
            useCORS: true, // 允许跨域图片
            backgroundColor: '#ffffff', // 设置背景为白色
            logging: false, // 关闭日志
            allowTaint: true,
            foreignObjectRendering: false // 禁用foreignObjectRendering，提高兼容性
        })
        .then((canvas) => {
            console.log('canvas生成成功，尺寸:', canvas.width, 'x', canvas.height);
            
            // 恢复原始样式
            shareCardContainer.style.display = originalDisplay;
            shareCardContainer.style.position = originalPosition;
            shareCard.style.borderRadius = originalBorderRadius;
            
            // 创建下载链接
            const link = document.createElement('a');
            link.download = `${DOM_ELEMENTS.cityName.textContent}_天气卡片_${new Date().toISOString().slice(0, 10)}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            
            console.log('分享卡片已保存');
        })
        .catch((error) => {
            console.error('html2canvas生成失败:', error);
            // 确保恢复原始样式
            shareCardContainer.style.display = originalDisplay;
            shareCardContainer.style.position = originalPosition;
            shareCard.style.borderRadius = originalBorderRadius;
        })
        .finally(() => {
            hideLoading();
        });
    } catch (error) {
        console.error('保存图片失败:', error);
        hideLoading();
    }
}

// 保存当前天气信息为PDF
function saveAsPDF() {
    // 移除showLoading()调用，避免截图时捕获到加载遮罩
    
    try {
        const container = document.querySelector('.container');
        if (!container) {
            console.error('找不到容器元素');
            return;
        }
        
        // 获取container的位置和尺寸信息
        const containerRect = container.getBoundingClientRect();
        
        // 首先截取整个body，获取完整的渐变背景
        html2canvas(document.body, {
            scale: 1, // 降低分辨率，提高性能和兼容性
            useCORS: true, // 允许跨域图片
            backgroundColor: null, // 设置为null以保留原网页背景
            logging: false, // 关闭日志
            allowTaint: true, // 允许跨域图片污染画布
            foreignObjectRendering: false // 禁用foreignObjectRendering，提高兼容性
        })
        .then((fullCanvas) => {
            // 创建一个新的canvas，用于裁剪出container区域
            const croppedCanvas = document.createElement('canvas');
            const ctx = croppedCanvas.getContext('2d');
            
            // 设置裁剪后的canvas尺寸为container的尺寸
            croppedCanvas.width = containerRect.width;
            croppedCanvas.height = containerRect.height;
            
            // 从完整的canvas中裁剪出container区域
            ctx.drawImage(
                fullCanvas, 
                containerRect.left, // 源图像的x坐标
                containerRect.top, // 源图像的y坐标
                containerRect.width, // 源图像的宽度
                containerRect.height, // 源图像的高度
                0, // 目标图像的x坐标
                0, // 目标图像的y坐标
                containerRect.width, // 目标图像的宽度
                containerRect.height // 目标图像的高度
            );
            
            // 创建PDF文档
            const { jsPDF } = window.jspdf;
            
            // 根据画布尺寸决定PDF方向
            const orientation = croppedCanvas.width > croppedCanvas.height ? 'landscape' : 'portrait';
            const pdf = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: 'a4'
            });
            
            // 计算canvas在PDF中的尺寸和位置
            const imgData = croppedCanvas.toDataURL('image/png');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = pdfWidth - 20; // PDF宽度减去边距
            const imgHeight = croppedCanvas.height * imgWidth / croppedCanvas.width;
            const margin = 10;
            
            // 如果图片高度超过一页，需要分页处理
            let position = margin;
            let remainingHeight = imgHeight;
            
            // 第一页
            pdf.addImage(imgData, 'PNG', margin, position, imgWidth, remainingHeight > pdfHeight - 2 * margin ? pdfHeight - 2 * margin : remainingHeight);
            remainingHeight -= pdfHeight - 2 * margin;
            
            // 后续页面
            while (remainingHeight > 0) {
                pdf.addPage();
                position = margin;
                pdf.addImage(imgData, 'PNG', margin, position, imgWidth, remainingHeight > pdfHeight - 2 * margin ? pdfHeight - 2 * margin : remainingHeight);
                remainingHeight -= pdfHeight - 2 * margin;
            }
            
            // 保存PDF
            pdf.save(`${DOM_ELEMENTS.cityName.textContent}_天气信息_${new Date().toISOString().slice(0, 10)}.pdf`);
            
            console.log('天气信息已保存为PDF');
        })
        .catch((error) => {
            console.error('保存PDF失败:', error);
        });
    } catch (error) {
        console.error('保存PDF失败:', error);
    }
}

// 扩展fetch以支持params参数
if (!fetch.polyfill) {
    const originalFetch = fetch;
    
    window.fetch = function(url, options) {
        if (options && options.params) {
            const params = new URLSearchParams(options.params);
            const separator = url.includes('?') ? '&' : '?';
            url += separator + params.toString();
        }
        
        return originalFetch(url, options);
    };
}